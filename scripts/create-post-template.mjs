import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsRoot = path.join(root, 'migration/wordpress-export/posts');

async function main() {
  const slug = process.argv[2]?.trim();

  if (!slug) {
    console.error('Usage: node scripts/create-post-template.mjs <slug>');
    process.exit(1);
  }

  if (slug.includes('/') || slug.includes('\\')) {
    console.error('Slug must not contain path separators.');
    process.exit(1);
  }

  const postDir = path.join(postsRoot, slug);
  const imagesDir = path.join(postDir, 'images');
  const indexPath = path.join(postDir, 'index.md');

  try {
    await fs.access(postDir);
    console.error(`Post already exists: ${slug}`);
    process.exit(1);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.mkdir(imagesDir, { recursive: true });
  await fs.writeFile(indexPath, templateFor(slug), 'utf8');

  console.log(`Created ${path.relative(root, indexPath)}`);
  console.log(`Created ${path.relative(root, imagesDir)}/`);
}

function templateFor(slug) {
  const title = slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');

  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo'
  }).format(new Date());

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

await main();
