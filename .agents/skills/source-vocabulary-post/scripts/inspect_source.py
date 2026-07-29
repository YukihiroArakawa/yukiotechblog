#!/usr/bin/env python3
"""Extract basic metadata from a PDF or HTML document URL."""

from __future__ import annotations

import argparse
import io
import json
import re
from html import unescape
from html.parser import HTMLParser
from urllib.request import Request, urlopen

from pypdf import PdfReader


class TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.in_title = False
        self.title = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "title":
            self.in_title = True

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self.in_title = False

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    args = parser.parse_args()

    request = Request(args.url, headers={"User-Agent": "yukiotechblog-source-inspector/1.0"})
    with urlopen(request) as response:
        content_type = response.headers.get_content_type()
        data = response.read()

    if content_type == "application/pdf" or args.url.lower().split("?", 1)[0].endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        title = reader.metadata.title if reader.metadata else None
        if not title or title.lower().endswith(".pdf"):
            first_page = reader.pages[0].extract_text() if reader.pages else ""
            lines = [line.strip() for line in first_page.splitlines() if line.strip()]
            title = next(
                (
                    line
                    for line in lines
                    if "@" not in line
                    and "©" not in line
                    and "proc." not in line.lower()
                    and not line.lower().startswith("msr-")
                ),
                "Untitled document",
            )
        result = {"kind": "pdf", "title": title.strip(), "pages": len(reader.pages)}
    else:
        html_title = TitleParser()
        html_title.feed(data.decode("utf-8", errors="replace"))
        title = re.sub(r"\s+", " ", unescape(html_title.title)).strip()
        result = {"kind": "html", "title": title or "Untitled document"}

    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
