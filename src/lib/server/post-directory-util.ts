import fs from 'node:fs/promises';
import path from 'node:path';
import { FileSystemUtil } from '$lib/server/file-system-util';

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
}
