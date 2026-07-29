#!/usr/bin/env python3
"""Replace existing transcript bodies with timestamp-grouped YouTube captions."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video-id", required=True)
    parser.add_argument("--post", type=Path, required=True)
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    transcript = YouTubeTranscriptApi().fetch(args.video_id, languages=[args.language])
    captions: dict[int, list[str]] = {}
    for snippet in transcript:
        captions.setdefault(int(snippet.start // 60), []).append(snippet.text)

    article = args.post.read_text(encoding="utf-8")
    headings = re.findall(r"^### (\d+):(\d+)–", article, flags=re.MULTILINE)
    for minutes, seconds in headings:
        start_seconds = int(minutes) * 60 + int(seconds)
        body = " ".join(captions.get(start_seconds // 60, []))
        if not body:
            raise ValueError(f"No captions found for {minutes}:{seconds}")

        heading = rf"### {minutes}:{seconds}–[^\n]+"
        pattern = re.compile(rf"({heading}\n\n)(.*?)(\n\n#### Vocabulary)", re.DOTALL)
        article, replacements = pattern.subn(rf"\1{body}\3", article, count=1)
        if replacements != 1:
            raise ValueError(f"Could not replace transcript body for {minutes}:{seconds}")

    args.post.write_text(article, encoding="utf-8")


if __name__ == "__main__":
    main()
