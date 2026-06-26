import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const postsRoot = path.join(root, 'migration/wordpress-export/posts');
const staticRoot = path.join(root, 'static');

async function main() {
  const entries = await fs.readdir(postsRoot, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const source = path.join(postsRoot, entry.name, 'images');
        const target = path.join(staticRoot, entry.name, 'images');

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
