#!/bin/zsh
# Громкость готового ролика к стандарту площадок (~ −14 LUFS, пики ≤ −1,5 dBFS); видео не перекодируется.
#   scripts/finalize.sh <in.mp4> <out.mp4> <поднять_дБ>
FF=${FFMPEG:-ffmpeg}
"$FF" -nostdin -y -loglevel error -i "$1" -c:v copy -af "volume=${3}dB,alimiter=limit=0.84:level=false:attack=3:release=60" -c:a aac -b:a 192k -movflags +faststart "$2"
