import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { FileSystemUtil } from './lib/file-system-util.mjs';
import { PostDateUtil } from './lib/post-date-util.mjs';
import { PostDirectoryUtil } from './lib/post-directory-util.mjs';

const root = process.cwd();
const postsRoot = path.join(root, 'content/posts');
const unclassifiedDirName = 'unclassified';

await main();

async function main() {
  const entries = await fs.readdir(postsRoot, { withFileTypes: true });
  const postDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== unclassifiedDirName)
    .map((entry) => entry.name)
    .sort();
  const seenSlugs = new Map();

  for (const dirName of postDirs) {
    const currentDir = path.join(postsRoot, dirName);
    const indexPath = path.join(currentDir, 'index.md');

    if (!(await FileSystemUtil.exists(indexPath))) {
      continue;
    }

    const frontmatter = await PostDirectoryUtil.readFrontmatter(currentDir);
    const slug = PostDirectoryUtil.resolveSlug(currentDir, frontmatter);
    const existingDir = seenSlugs.get(slug);

    if (existingDir) {
      throw new Error(`Duplicate slug found: ${slug} (${existingDir}, ${dirName})`);
    }

    seenSlugs.set(slug, dirName);
    const monthDir = PostDateUtil.deriveMonthDirectory(frontmatter.date);
    const targetParent = path.join(postsRoot, monthDir ?? unclassifiedDirName);
    const targetDir = path.join(targetParent, dirName);

    if (currentDir === targetDir) {
      continue;
    }

    if (await FileSystemUtil.exists(targetDir)) {
      throw new Error(`Target already exists: ${path.relative(root, targetDir)}`);
    }

    await fs.mkdir(targetParent, { recursive: true });
    await fs.rename(currentDir, targetDir);

    console.log(`${path.relative(root, currentDir)} -> ${path.relative(root, targetDir)}`);
  }
}
