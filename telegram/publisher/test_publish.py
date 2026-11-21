"""Offline regression tests: python -m unittest discover -s telegram/publisher."""
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import textwrap
import unittest
from unittest.mock import patch

PUBLISH = Path(__file__).with_name("publish.py").resolve()
WORKFLOW = PUBLISH.parents[2] / ".github/workflows/telegram-publish.yml"


def git(path, *args):
    return subprocess.run(
        ["git", "-C", str(path), "-c", "core.hooksPath=/dev/null",
         "-c", "commit.gpgsign=false", *args],
        check=True, text=True, capture_output=True,
    ).stdout.strip()


def run_publisher(checkout, api, **overrides):
    spec = importlib.util.spec_from_file_location("publish_fixture", PUBLISH)
    publisher = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(publisher)
    publisher.TELEGRAM = checkout / "telegram"
    publisher.POSTS = publisher.TELEGRAM / "schedule/posts.json"
    env = {"TELEGRAM_BOT_TOKEN": "fixture", "TELEGRAM_CHANNEL": "@fixture", **overrides}
    with (
        patch.dict(os.environ, env, clear=True),
        patch.object(sys, "argv", [str(PUBLISH)]),
        patch.object(publisher, "api", api),
        patch.object(publisher.urllib.request, "urlopen", side_effect=AssertionError("network forbidden")),
        contextlib.redirect_stdout(io.StringIO()),
    ):
        publisher.main()


class PublishTest(unittest.TestCase):
    def setUp(self):
        tmp = self.enterContext(tempfile.TemporaryDirectory())
        self.root = Path(tmp)
        self.remote = self.root / "remote.git"
        self.job = self.root / "job"
        git(self.root, "init", "-q", "--bare", "--initial-branch=main", str(self.remote))
        git(self.root, "clone", "-q", str(self.remote), str(self.job))
        self.schedule = "telegram/schedule/posts.json"
        posts = self.job / self.schedule
        posts.parent.mkdir(parents=True)
        posts.write_text(json.dumps([{
            "id": 25, "date": "2000-01-01", "status": "pending", "title": "Test podcast",
            "body": "Test caption", "photo_file": "media/card.jpg", "audio_file": "media/audio.mp3",
        }]), encoding="utf-8")
        (self.job / "telegram/media").mkdir()
        (self.job / "telegram/media/card.jpg").write_bytes(b"stub photo")
        (self.job / "telegram/media/audio.mp3").write_bytes(b"stub audio")
        git(self.job, "add", ".")
        git(self.job, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid",
            "commit", "-qm", "Fixture")
        git(self.job, "push", "-q", "origin", "main")
        self.calls = []

    def api(self, token, method, data, files):
        self.calls.append(method)
        if method == "sendPhoto":
            return {"ok": True, "result": {"message_id": 100}}
        if method == "sendAudio":
            return {"ok": False, "description": "fixture: rejected audio"}
        self.fail(f"unexpected API method {method}")

    def save_workflow_result(self):
        # Run the actual persistence script against a local bare Git remote.
        workflow = WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("id: publish_post", workflow)
        step = workflow.split("- name: Сохраняем результат публикации\n", 1)[1]
        self.assertIn(
            "if: ${{ !cancelled() && (steps.publish_post.outcome == 'success' || "
            "steps.publish_post.outcome == 'failure') }}", step,
        )
        shell = textwrap.dedent(step.split("        run: |\n", 1)[1])
        subprocess.run(
            ["bash", "-e", "-c", shell], cwd=self.job, check=True, capture_output=True,
            env={**os.environ, "GIT_CONFIG_COUNT": "2", "GIT_CONFIG_KEY_0": "core.hooksPath",
                 "GIT_CONFIG_VALUE_0": "/dev/null", "GIT_CONFIG_KEY_1": "commit.gpgsign",
                 "GIT_CONFIG_VALUE_1": "false"},
        )

    def test_audio_rejection_keeps_failure_and_next_checkout_skips_card(self):
        with self.assertRaisesRegex(SystemExit, "fixture: rejected audio"):
            run_publisher(self.job, self.api)
        self.assertEqual(self.calls, ["sendPhoto", "sendAudio"])
        self.save_workflow_result()
        next_job = self.root / "next-job"
        git(self.root, "clone", "-q", str(self.remote), str(next_job))
        [post] = json.loads((next_job / self.schedule).read_text(encoding="utf-8"))
        self.assertEqual(post["status"], "published")
        self.assertEqual(post["message_id"], 100)
        self.assertEqual(post["media_error"], "fixture: rejected audio")
        self.assertNotIn("media_message_id", post)
        run_publisher(next_job, self.api)
        run_publisher(next_job, self.api, POST_ID="25")
        self.assertEqual(self.calls, ["sendPhoto", "sendAudio"])

    def test_photo_rejection_does_not_record_a_publication(self):
        before = git(self.job, "rev-parse", "HEAD")

        def reject_photo(token, method, data, files):
            self.calls.append(method)
            return {"ok": False, "description": "fixture: rejected photo"}

        with self.assertRaisesRegex(SystemExit, "fixture: rejected photo"):
            run_publisher(self.job, reject_photo)
        self.assertEqual(self.calls, ["sendPhoto"])
        self.save_workflow_result()
        self.assertEqual(git(self.job, "rev-parse", "HEAD"), before)
        self.assertEqual(git(self.remote, "rev-parse", "main"), before)

    def test_success_persists_photo_and_audio_receipts(self):
        def accept_audio(token, method, data, files):
            if method == "sendAudio":
                self.calls.append(method)
                return {"ok": True, "result": {"message_id": 101}}
            return self.api(token, method, data, files)

        run_publisher(self.job, accept_audio)
        self.save_workflow_result()
        self.assertEqual(self.calls, ["sendPhoto", "sendAudio"])
        [post] = json.loads(git(self.remote, "show", f"main:{self.schedule}"))
        self.assertEqual((post["status"], post["message_id"], post["media_message_id"]),
                         ("published", 100, 101))
        self.assertNotIn("media_error", post)
