import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';

const postsRoot = path.join(process.cwd(), 'migration/wordpress-export/posts');

const representativeSlugs = [
  'make-destroy-restore-new-sql-ch8-hands-on',
  'go-lang-tutorial',
  'learn-tidb-from-their-architecture',
  'tidb-ddl-import-error'
] as const;

const excludedSlugs = new Set(['単語リスト-補助解説-build-your-own-database-from-scrach-in-go']);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  representative: boolean;
};

export type Post = PostSummary & {
  html: string;
};

type Frontmatter = {
  title?: string;
  date?: string | Date;
  categories?: string[];
  slug?: string;
};

export async function listPosts(): Promise<PostSummary[]> {
  const dirs = await fs.readdir(postsRoot, { withFileTypes: true });
  const posts = await Promise.all(
    dirs
      .filter((dir) => dir.isDirectory())
      .map(async (dir) => {
        try {
          return await readPostSummary(dir.name);
        } catch {
          return undefined;
        }
      })
  );

  return posts
    .filter((post): post is PostSummary => Boolean(post))
    .filter((post) => !excludedSlugs.has(post.slug))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function listRepresentativePosts(): Promise<PostSummary[]> {
  const posts = await listPosts();
  const rank = new Map<string, number>(representativeSlugs.map((slug, index) => [slug, index]));

  return posts
    .filter((post) => rank.has(post.slug))
    .sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!);
}

export async function readPost(slug: string): Promise<Post> {
  const source = await readMarkdown(slug);
  const parsed = parseMarkdown(slug, source);
  const html = md.render(rewriteImageLinks(parsed.content, parsed.slug));

  return {
    ...summaryFromParsed(parsed),
    html
  };
}

async function readPostSummary(dirName: string): Promise<PostSummary> {
  const source = await readMarkdown(dirName);
  return summaryFromParsed(parseMarkdown(dirName, source));
}

async function readMarkdown(dirName: string): Promise<string> {
  return fs.readFile(path.join(postsRoot, dirName, 'index.md'), 'utf8');
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

function summaryFromParsed(parsed: ReturnType<typeof parseMarkdown>): PostSummary {
  return {
    slug: parsed.slug,
    title: parsed.data.title || parsed.slug,
    date: normalizeDate(parsed.data.date),
    categories: parsed.data.categories || [],
    excerpt: excerpt(parsed.content),
    representative: representativeSlugs.includes(
      parsed.slug as (typeof representativeSlugs)[number]
    )
  };
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
