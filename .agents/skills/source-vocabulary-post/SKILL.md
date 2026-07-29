---
name: source-vocabulary-post
description: Create vocabulary-only blog posts from paper or article URLs in this repository. Use when Codex needs to inspect a PDF or HTML document, create a post with `just new-post`, add a source reference, and build section-by-section CEFR B1-or-higher vocabulary and phrase tables.
---

# Source Vocabulary Post

1. Retrieve source metadata in the project development shell:

   ```bash
   nix develop . -c python .agents/skills/source-vocabulary-post/scripts/inspect_source.py <url>
   ```

2. Normalize the complete document title into a lowercase hyphenated slug, prefix it with `vocabulary-`, and create the post with `nix develop . -c just new-post <slug>`. For example, `A Critique of ANSI SQL Isolation Levels` becomes `vocabulary-a-critique-of-ansi-sql-isolation-levels`.
3. Set frontmatter to `title: "[Vocabulary] <document title>"`. Set categories to the fixed `vocabulary` and `english-learning` categories plus one topic-specific category.
4. Begin the body with `## Reference` and put the canonical source URL immediately below it. Do not reproduce, quote, summarize, or otherwise include the source body in the post.
5. Create one `###` heading for each meaningful section in the source. Use the source section title when available; otherwise, use a short neutral section label.
6. Under each section heading, add `#### Vocabulary` and `#### Phrases` tables. Select only terms and expressions that occur in that source section and are CEFR B1 or above. Use the columns `Word or expression`, `IPA`, `Simple English meaning`, and `Example` for vocabulary, and `Phrase`, `Meaning`, and `Example` for phrases. Write all definitions and example sentences in English, using original examples rather than copying source sentences.
7. Verify every Markdown table: its header, delimiter, and data rows must have the same number of columns. In particular, the four-column Vocabulary delimiter is `| --- | --- | --- | --- |`; the three-column Phrases delimiter is `| --- | --- | --- |`.
8. Run `nix develop . -c pnpm exec prettier --check <post-path>` and inspect the diff before handoff.
