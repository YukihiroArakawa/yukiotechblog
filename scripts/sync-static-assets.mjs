import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsRoot = path.join(root, 'migration/wordpress-export/posts');
const staticPostsRoot = path.join(root, 'static/posts');

async function main() {
  await fs.rm(staticPostsRoot, { recursive: true, force: true });
  await fs.mkdir(staticPostsRoot, { recursive: true });

  const entries = await fs.readdir(postsRoot, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const source = path.join(postsRoot, entry.name, 'images');
        const target = path.join(staticPostsRoot, entry.name, 'images');

        try {
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
