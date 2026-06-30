import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { FileSystemUtil } from '../lib/shared/file-system-util';
import { PostDateUtil } from '../lib/shared/post-date-util';
import { PostDirectoryUtil } from '../lib/shared/post-directory-util';

const root = process.cwd();
const postsRoot = path.join(root, 'content/posts');

await main();

async function main() {
  const slug = process.argv[2]?.trim();

  if (!slug) {
    console.error('Usage: pnpm exec node --import tsx src/scripts/create-post-template.ts <slug>');
    process.exit(1);
  }

  if (slug.includes('/') || slug.includes('\\')) {
    console.error('Slug must not contain path separators.');
    process.exit(1);
  }

  const date = PostDateUtil.currentDateInTokyo();
  const monthDir = date.slice(0, 7).replace('-', '');
  const postDir = path.join(postsRoot, monthDir, slug);
  const imagesDir = path.join(postDir, 'images');
  const indexPath = path.join(postDir, 'index.md');

  if (await hasExistingSlug(slug)) {
    console.error(`Slug already exists: ${slug}`);
    process.exit(1);
  }

  if (await FileSystemUtil.exists(postDir)) {
    console.error(`Post already exists: ${slug}`);
    process.exit(1);
  }

  await fs.mkdir(imagesDir, { recursive: true });
  await fs.writeFile(indexPath, templateFor(slug, date), 'utf8');

  console.log(`Created ${path.relative(root, indexPath)}`);
  console.log(`Created ${path.relative(root, imagesDir)}/`);
}

function templateFor(slug: string, date: string): string {
  const title = slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

  return `---
title: "${title}"
date: ${date}
categories: []
slug: "${slug}"
type: "post"
---

## Introduction

Write your draft here.
`;
}

async function hasExistingSlug(slug: string): Promise<boolean> {
  const postDirs = await PostDirectoryUtil.findPostDirectories(postsRoot);

  for (const existingDir of postDirs) {
    const frontmatter = await PostDirectoryUtil.readFrontmatter(existingDir);
    const existingSlug = PostDirectoryUtil.resolveSlug(existingDir, frontmatter);

    if (existingSlug === slug) {
      return true;
    }
  }

  return false;
}
