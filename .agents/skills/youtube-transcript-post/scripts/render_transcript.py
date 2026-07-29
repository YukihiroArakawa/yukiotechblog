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
    article = args.post.read_text(encoding="utf-8")
    headings = re.findall(r"^### (\d+):(\d+)–(\d+):(\d+) ", article, flags=re.MULTILINE)
    for start_minutes, start_seconds, end_minutes, end_seconds in headings:
        start = int(start_minutes) * 60 + int(start_seconds)
        end = int(end_minutes) * 60 + int(end_seconds)
        # Keep caption chunks readable without merging or dropping their words.
        body = "\n\n".join(
            snippet.text for snippet in transcript if start <= snippet.start < end
        )
        if not body:
            raise ValueError(f"No captions found for {start_minutes}:{start_seconds}")

        heading = rf"### {start_minutes}:{start_seconds}–{end_minutes}:{end_seconds} [^\n]+"
        pattern = re.compile(rf"({heading}\n\n)(.*?)(\n\n#### Vocabulary)", re.DOTALL)
        article, replacements = pattern.subn(rf"\1{body}\3", article, count=1)
        if replacements != 1:
            raise ValueError(
                f"Could not replace transcript body for {start_minutes}:{start_seconds}"
            )

    args.post.write_text(article, encoding="utf-8")


if __name__ == "__main__":
    main()
