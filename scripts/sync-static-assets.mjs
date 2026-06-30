import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PostDirectoryUtil } from './lib/post-directory-util.mjs';

const root = process.cwd();
const postsRoot = path.join(root, 'content/posts');
const staticRoot = path.join(root, 'static');

async function main() {
  const postDirs = await PostDirectoryUtil.findPostDirectories(postsRoot);

  await Promise.all(
    postDirs.map(async (postDir) => {
      const source = path.join(postDir, 'images');
      const frontmatter = await PostDirectoryUtil.readFrontmatter(postDir);
      const slug = PostDirectoryUtil.resolveSlug(postDir, frontmatter);
      const target = path.join(staticRoot, slug, 'images');

      try {
        await fs.rm(target, { recursive: true, force: true });
        await fs.cp(source, target, { recursive: true });
      } catch (error) {
        if (error?.code !== 'ENOENT') {
          throw error;
        }
      }
    })
  );
}

await main();
