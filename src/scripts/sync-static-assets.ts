import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { PostDirectoryUtil } from '../lib/shared/post-directory-util';

const root = process.cwd();
const postsRoot = path.join(root, 'content/posts');
const staticRoot = path.join(root, 'static');

await main();

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
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    })
  );
}
