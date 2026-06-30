import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { FileSystemUtil } from './file-system-util';

type Frontmatter = {
  slug?: string;
};

export class PostDirectoryUtil {
  static async findPostDirectories(rootDir: string): Promise<string[]> {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    const results: string[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const dirPath = path.join(rootDir, entry.name);
      const indexPath = path.join(dirPath, 'index.md');

      if (await FileSystemUtil.exists(indexPath)) {
        results.push(dirPath);
        continue;
      }

      results.push(...(await this.findPostDirectories(dirPath)));
    }

    return results;
  }

  static async readFrontmatter(postDir: string): Promise<Record<string, unknown>> {
    const indexPath = path.join(postDir, 'index.md');
    const parsed = matter(await fs.readFile(indexPath, 'utf8'));
    return parsed.data;
  }

  static resolveSlug(postDir: string, frontmatter: Record<string, unknown>): string {
    return (frontmatter as Frontmatter).slug || path.basename(postDir);
  }
}
