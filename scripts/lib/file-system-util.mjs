import fs from 'node:fs/promises';

export class FileSystemUtil {
  static async exists(targetPath) {
    try {
      await fs.access(targetPath);
      return true;
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return false;
      }

      throw error;
    }
  }
}
