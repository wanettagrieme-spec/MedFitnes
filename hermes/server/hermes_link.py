#!/usr/bin/env python3
"""Small, file-based Claude/Codex ↔ Hermes bridge; no model calls in sync."""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tempfile
import uuid

HOME = Path.home()
EXCHANGE = Path(os.environ.get('HERMES_EXCHANGE', HOME / '.hermes/exchange'))
VAULT = Path(os.environ.get('MEDFIT_VAULT', HOME / 'obsidian claude/medifit-vault/medfit-vault'))
STATE = Path(os.environ.get('HERMES_LINK_STATE', HOME / '.hermes/link'))
SSH = ['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=12', '-o', 'ServerAliveInterval=10', 'hostkey-vps',
       'sudo -u hermes -H python3 /home/hermes/.hermes/scripts/hermes_link.py rpc']


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def atomic(path, data):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix='.link-')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def read(path):
    return path.read_text(encoding='utf-8') if path.exists() else None


def task_name(name):
    if Path(name).name != name or not name.endswith('.md') or name == 'README.md':
        raise ValueError('Invalid task name')
    return name


def valid_target(target):
    parts = PurePosixPath(target).parts
    if '..' in parts or PurePosixPath(target).is_absolute():
        raise ValueError('Invalid record path')
    if target == 'log.md':
        return 'append'
    if len(parts) == 2 and parts[0] == 'Журнал' and re.fullmatch(r'\d{4}-\d{2}-\d{2}\.md', parts[1]):
        return 'append'
    if len(parts) == 2 and parts[0] == 'Входящие' and parts[1].endswith('.md'):
        return 'file'
    raise ValueError('Record outside allowed paths')


def record(target, text, event_id=None):
    mode = valid_target(target)
    event = {'id': event_id or uuid.uuid4().hex, 'target': target, 'mode': mode, 'text': text, 'created': now()}
    atomic(EXCHANGE / 'outbox' / (event['id'] + '.json'), json.dumps(event, ensure_ascii=False))
    return event['id']


def snapshot():
    tasks = {p.name: p.read_text() for p in sorted((EXCHANGE / 'tasks').glob('*.md')) if p.name != 'README.md'}
    records = [json.loads(p.read_text()) for p in sorted((EXCHANGE / 'outbox').glob('*.json'))]
    cache = HOME / 'medfit-vault'
    cache_health = {}
    if (cache / '.git').exists():
        result = subprocess.run(['git', '-C', str(cache), 'status', '--porcelain'], text=True, capture_output=True, timeout=10)
        cache_health['dirty'] = bool(result.stdout.strip()) or result.returncode != 0
    return {'tasks': tasks, 'records': records, 'time': now(), 'cache': cache_health}


def server_rpc(request):
    EXCHANGE.mkdir(parents=True, exist_ok=True)
    (EXCHANGE / 'tasks').mkdir(exist_ok=True)
    (EXCHANGE / 'outbox').mkdir(exist_ok=True)
    if request['op'] == 'snapshot':
        return snapshot()
    if request['op'] == 'update':
        changed = []
        for name, entry in request.get('tasks', {}).items():
            path = EXCHANGE / 'tasks' / task_name(name)
            if read(path) != entry['expected']:
                raise RuntimeError('Remote task changed during synchronization: ' + name)
        for name, entry in request.get('tasks', {}).items():
            path = EXCHANGE / 'tasks' / name
            if read(path) != entry['text']:
                atomic(path, entry['text'])
                changed.append(name)
        for event_id in request.get('ack', []):
            if not re.fullmatch(r'[a-f0-9]{16,64}', event_id):
                raise ValueError('Invalid event id')
            source = EXCHANGE / 'outbox' / (event_id + '.json')
            if source.exists():
                destination = EXCHANGE / 'delivered' / source.name
                destination.parent.mkdir(exist_ok=True)
                os.replace(source, destination)
        atomic(EXCHANGE / 'last-contact.json', json.dumps({'time': now(), 'task_changes': changed}))
        return {'ok': True, 'changed': changed}
    raise ValueError('Unknown operation')


def remote(request):
    result = subprocess.run(SSH, input=json.dumps(request, ensure_ascii=False), text=True, capture_output=True, timeout=40)
    if result.returncode:
        raise RuntimeError(result.stderr.strip()[:400] or 'SSH failed')
    return json.loads(result.stdout)


def merge(base, local, remote_text):
    if local == remote_text:
        return local
    if base is not None and remote_text is not None:
        def instructions(value):
            value = value.split('## Результат', 1)[0]
            return re.sub(r'^статус:.*$', 'статус: <worker>', value, flags=re.M)
        if instructions(base) != instructions(remote_text):
            raise RuntimeError('Worker changed task instructions; review required')
    if local == base:
        return remote_text
    if remote_text == base:
        return local
    if local is None or remote_text is None:
        raise RuntimeError('Deletion or independent task creation conflict')
    with tempfile.TemporaryDirectory() as temp:
        paths = [Path(temp) / name for name in ('local', 'base', 'remote')]
        for path, value in zip(paths, (local, base or '', remote_text)):
            path.write_text(value)
        result = subprocess.run(['git', 'merge-file', '-p', *map(str, paths)], capture_output=True, text=True)
        if result.returncode:
            raise RuntimeError('Concurrent edits need review')
        return result.stdout


def busy_scope(tasks, scope):
    for known in tasks.values():
        if known.get('scope') != scope:
            continue
        existing = read(EXCHANGE / 'tasks' / known['name']) or ''
        if not re.search(r'^статус:\s*["\x27]?(принято|отменено)["\x27]?\s*$', existing, re.M):
            return known
    return None


def import_event(event):
    mode = valid_target(event['target'])
    if mode != event['mode']:
        raise ValueError('Record mode mismatch')
    path = VAULT / event['target']
    text = event['text']
    marker = '<!-- hermes-link:' + event['id'] + ' -->'
    previous = read(path)
    if marker in (previous or '') or text.strip() in (previous or ''):
        return
    if mode == 'file' and previous is not None:
        raise RuntimeError('Incoming filename already exists: ' + event['target'])
    if mode == 'append':
        prefix = ''
        if previous is None and event['target'].startswith('Журнал/'):
            day = path.stem
            prefix = f'---\nтип: журнал\nсоздано: {day}\nобновлено: {day}\n---\n\n# {day}\n'
        # O_APPEND preserves any concurrent writer's existing content.
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open('a', encoding='utf-8') as stream:
            stream.write(prefix + '\n' + marker + '\n' + text.strip() + '\n')
            stream.flush()
            os.fsync(stream.fileno())
    else:
        atomic(path, text.rstrip() + '\n\n' + marker + '\n')


def synchronize():
    STATE.mkdir(parents=True, exist_ok=True)
    with (STATE / 'sync.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return {'status': 'already_running'}
        prior = json.loads(read(STATE / 'state.json') or '{"bases":{}}')
        data = remote({'op': 'snapshot'})
        folder = VAULT / 'Задания Hermes'
        local = {p.name: p.read_text() for p in sorted(folder.glob('*.md')) if p.name != 'README.md'}
        changes, merged, conflicts = {}, {}, []
        for name in sorted(set(local) | set(data['tasks'])):
            left, right = local.get(name), data['tasks'].get(name)
            base = prior['bases'].get(name)
            if name not in prior['bases']:
                g = subprocess.run(['git', '-C', str(VAULT), 'show', 'HEAD:Задания Hermes/' + name], text=True, capture_output=True)
                base = g.stdout if g.returncode == 0 else None
            try:
                value = merge(base, left, right)
                if value is not None:
                    merged[name] = value
                    changes[name] = {'expected': right, 'text': value}
            except RuntimeError as error:
                conflicts.append(name + ': ' + str(error))
                atomic(STATE / 'conflicts' / (hashlib.sha256(name.encode()).hexdigest()[:16] + '.json'),
                       json.dumps({'name': name, 'base': base, 'local': left, 'server': right}, ensure_ascii=False, indent=2))
        ack = []
        for event in data['records']:
            try:
                import_event(event)
                ack.append(event['id'])
            except Exception as error:
                conflicts.append(event['target'] + ': ' + str(error))
        remote({'op': 'update', 'tasks': changes, 'ack': ack})
        for name, value in merged.items():
            path = folder / task_name(name)
            if read(path) != local.get(name):
                conflicts.append(name + ': local changed during sync; retry next cycle')
                continue
            if read(path) != value:
                atomic(path, value)
            prior['bases'][name] = value
        atomic(STATE / 'state.json', json.dumps(prior, ensure_ascii=False))
        warnings = ['Server Git cache has local edits; updates may be blocked'] if data.get('cache', {}).get('dirty') else []
        status = {'status': 'attention' if conflicts or warnings else 'ok', 'last_success': now(),
                  'tasks': len(merged), 'records_delivered': len(ack), 'conflicts': conflicts,
                  'warnings': warnings, 'transport': 'SSH', 'supervisor': 'Claude'}
        atomic(STATE / 'status.json', json.dumps(status, ensure_ascii=False, indent=2))
        return status


LEASE_TIMEOUT_S = 60 * 60  # Claude 05.11.2026


def monitor():
    lease_path = EXCHANGE / 'executor.json'
    if lease_path.exists():
        lease = json.loads(lease_path.read_text())
        path = EXCHANGE / 'tasks' / lease['task']
        content = read(path) or ''
        if re.search(r'^статус:\s*["\x27]?(готово|нужна помощь|принято|отменено)["\x27]?\s*$', content, re.M):
            lease_path.unlink()
        elif (dt.datetime.now(dt.timezone.utc) - dt.datetime.fromisoformat(lease['started'])).total_seconds() > LEASE_TIMEOUT_S:
            # Claude 05.11.2026: зависшее задание не должно навсегда блокировать очередь
            if content:
                content = re.sub(r'^статус:.*$', 'статус: нужна помощь', content, count=1, flags=re.M)
                content += '\n\n(Автоматически, ' + now() + ': исполнитель не закончил за ' + str(LEASE_TIMEOUT_S // 60) + ' мин — задание снято с исполнителя, очередь освобождена.)\n'
                atomic(path, content)
            lease_path.unlink()
            print('таймаут исполнителя, очередь освобождена: ' + lease['task'])
        else:
            print('исполнитель занят: ' + lease['task'])
            return
    fresh = []
    for path in sorted((EXCHANGE / 'tasks').glob('*.md')):
        text = path.read_text()
        if re.search(r'^статус:\s*["\x27]?новое["\x27]?\s*$', text, re.M):
            fresh.append(str(path) + ' sha256=' + hashlib.sha256(text.encode()).hexdigest()[:12])
    print('\n'.join(fresh) if fresh else 'новых заданий нет')


def claim(name):
    path = EXCHANGE / 'tasks' / task_name(name)
    text = read(path)
    if text is None or not re.search(r'^статус:\s*["\x27]?новое["\x27]?\s*$', text, re.M):
        raise RuntimeError('Task is absent or already taken')
    lease = {'task': name, 'executor': 'Hermes', 'started': now()}
    lease_path = EXCHANGE / 'executor.json'
    try:
        fd = os.open(lease_path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError:
        raise RuntimeError('Another task owns the executor; do not start')
    with os.fdopen(fd, 'w') as stream:
        json.dump(lease, stream, ensure_ascii=False)
        stream.flush()
        os.fsync(stream.fileno())
    if read(path) != text:
        lease_path.unlink()
        raise RuntimeError('Task changed before claim; retry after review')
    text = re.sub(r'^статус:.*$', 'статус: в работе', text, count=1, flags=re.M)
    atomic(path, text)
    return lease


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['rpc', 'sync', 'monitor', 'record', 'status', 'claim'])
    parser.add_argument('--target')
    parser.add_argument('--text-file')
    parser.add_argument('--task')
    args = parser.parse_args()
    if args.mode == 'rpc':
        print(json.dumps(server_rpc(json.load(sys.stdin)), ensure_ascii=False))
    elif args.mode == 'monitor':
        monitor()
    elif args.mode == 'record':
        print(record(args.target, Path(args.text_file).read_text()))
    elif args.mode == 'claim':
        print(json.dumps(claim(args.task), ensure_ascii=False))
    elif args.mode == 'status':
        print(read(STATE / 'status.json') or 'not checked')
    else:
        try:
            print(json.dumps(synchronize(), ensure_ascii=False))
        except Exception as error:
            STATE.mkdir(parents=True, exist_ok=True)
            atomic(STATE / 'status.json', json.dumps({'status': 'error', 'checked': now(), 'error': str(error)}, ensure_ascii=False))
            print(str(error), file=sys.stderr)
            sys.exit(1)


if __name__ == '__main__':
    main()
