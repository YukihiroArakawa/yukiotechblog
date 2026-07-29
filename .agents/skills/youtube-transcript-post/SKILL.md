---
name: youtube-transcript-post
description: Create an English-learning Markdown post from a YouTube video in this SvelteKit blog. Use when Codex needs to retrieve a YouTube transcript with Python, create a post through `just new-post`, and organize a timestamped summary with vocabulary and phrases.
---

# YouTube Transcript Post

1. Read the repository `AGENTS.md` and inspect a recent English-learning post for the required Markdown style.
2. Add `pkgs.python312` and `pkgs.python312Packages.youtube-transcript-api` to `flake.nix` if they are not already present. Do not install the library globally.
3. Run the transcript retrieval inside the project development shell. Use `scripts/render_transcript.py` to insert caption chunks into an existing post without losing words at sentence or timestamp boundaries:

   ```bash
   nix develop . -c python .agents/skills/youtube-transcript-post/scripts/render_transcript.py --video-id <video-id> --post <post-path>
   ```

   Retrieve available captions with `YouTubeTranscriptApi().list(video_id)` if English captions are unavailable. Report a missing or blocked transcript rather than inventing one.

4. Verify the complete, official video title from YouTube page metadata before creating the post. Do not shorten, infer, or omit title components such as episode numbers, versions, or subtitles. Normalize that exact title into a lowercase hyphenated slug by removing punctuation and replacing whitespace with hyphens, then create the template with `nix develop . -c just new-post <slug>`. For example, `Distributed Systems 1.1: Introduction` becomes `distributed-systems-1-1-introduction`.
5. Set frontmatter to `title: "[Transcript/Vocabulary] <video title>"`, include `english-learning` and one topic-specific category, and retain the generated date and slug.
6. Add `Reference` and `Transcript` sections. Split the video into approximately 30-second timestamp ranges using the format `0:00–0:30 — Topic`. Use a shorter final range when the video does not end on a full interval.
7. Use the auto-generated captions as the transcript body. Group complete caption chunks by their `start` timestamp; preserve every chunk, its order, and its wording. Render each chunk as a separate Markdown paragraph so the transcript does not become one long line. Do not omit short connecting words or fillers. Make only minimal editorial corrections after rendering: sentence capitalization, punctuation, obvious casing, clear proper-noun corrections, and unambiguous speech-recognition errors. Do not summarize, reorder, add explanatory prose, or silently fill gaps in the captions. After every interval, add `Vocabulary` and `Phrases` tables with simple English definitions. Select only terms and expressions that occur in that interval and are CEFR B1 upper-intermediate or above (approximately TOEIC 700 or above); prefer advanced general vocabulary, idioms, and technical terms over basic words and phrases.
8. Run a targeted check after editing, at minimum `nix develop . -c pnpm exec prettier --check <post-path>`. Inspect the diff and preserve unrelated worktree changes.
