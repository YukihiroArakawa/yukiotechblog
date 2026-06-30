import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import { PostDirectoryUtil } from '$lib/server/post-directory-util';
import { PostVisibilityPolicy } from '$lib/server/post-visibility-policy';

const postsRoot = path.join(process.cwd(), 'content/posts');

const md = new MarkdownIt({
  html: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, {
          ignoreIllegals: true,
          language: lang
        }).value;

        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch {
        // Fall through to escaped output.
      }
    }

    return `<pre><code class="hljs">${escapeHtml(code)}</code></pre>`;
  },
  linkify: true,
  typographer: true
});

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
};

export type Post = PostSummary & {
  html: string;
};

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
};

type Frontmatter = {
  title?: string;
  date?: string | Date;
  categories?: string[];
  slug?: string;
};

type ParsedPost = ReturnType<typeof parseMarkdown> & {
  dirPath: string;
};

export async function listPosts(): Promise<PostSummary[]> {
  const posts = await listParsedPosts();

  return posts.map(summaryFromParsed).sort((a, b) => b.date.localeCompare(a.date));
}

export async function listCategories(): Promise<CategorySummary[]> {
  const posts = await listPosts();
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const category of post.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      count,
      name,
      slug: categorySlug(name)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listPostsByCategory(categorySlugParam: string): Promise<PostSummary[]> {
  const category = decodeCategorySlug(categorySlugParam);
  const posts = await listPosts();

  return posts.filter((post) => post.categories.includes(category));
}

export async function readPost(slug: string): Promise<Post> {
  const posts = await listParsedPosts();
  const parsed = posts.find((post) => post.slug === slug);

  if (!parsed) {
    throw new Error(`Post not found: ${slug}`);
  }

  const html = md.render(rewriteImageLinks(parsed.content, parsed.slug));

  return {
    ...summaryFromParsed(parsed),
    html
  };
}

async function listParsedPosts(): Promise<ParsedPost[]> {
  const dirPaths = await PostDirectoryUtil.findPostDirectories(postsRoot);
  const posts = await Promise.all(dirPaths.map((dirPath) => readParsedPost(dirPath)));
  const publishedPosts = posts.filter((post) => !PostVisibilityPolicy.isDraft(post.data.title));

  ensureUniqueSlugs(publishedPosts);

  return publishedPosts;
}

async function readParsedPost(dirPath: string): Promise<ParsedPost> {
  const source = await fs.readFile(path.join(dirPath, 'index.md'), 'utf8');
  const dirName = path.basename(dirPath);

  return {
    ...parseMarkdown(dirName, source),
    dirPath
  };
}

function parseMarkdown(dirName: string, source: string) {
  const parsed = matter(source);
  const data = parsed.data as Frontmatter;
  const slug = data.slug || dirName;

  return {
    content: parsed.content,
    data,
    dirName,
    slug
  };
}

function summaryFromParsed(parsed: ParsedPost): PostSummary {
  return {
    slug: parsed.slug,
    title: parsed.data.title || parsed.slug,
    date: normalizeDate(parsed.data.date),
    categories: parsed.data.categories || [],
    excerpt: excerpt(parsed.content)
  };
}

function ensureUniqueSlugs(posts: ParsedPost[]): void {
  const seen = new Map<string, string>();

  for (const post of posts) {
    const existing = seen.get(post.slug);

    if (existing) {
      throw new Error(`Duplicate slug found: ${post.slug} (${existing}, ${post.dirPath})`);
    }

    seen.set(post.slug, post.dirPath);
  }
}

function normalizeDate(date: Frontmatter['date']): string {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }

  return date || '';
}

function excerpt(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/[#>*_`[\]()\\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);
}

function rewriteImageLinks(content: string, slug: string): string {
  return content.replaceAll('(images/', `(/${slug}/images/`);
}

function categorySlug(category: string): string {
  return category;
}

function decodeCategorySlug(categorySlugParam: string): string {
  return decodeURIComponent(categorySlugParam);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
