export class PostVisibilityPolicy {
  private static readonly draftTitleMarker = '[draft]';

  static isDraft(title?: string): boolean {
    if (!title) {
      return false;
    }

    return title.toLowerCase().includes(this.draftTitleMarker);
  }
}
