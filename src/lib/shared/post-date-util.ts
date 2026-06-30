export class PostDateUtil {
  static currentDateInTokyo(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Tokyo'
    }).format(new Date());
  }

  static deriveMonthDirectory(dateValue: string | Date | undefined): string | undefined {
    if (dateValue instanceof Date) {
      return this.formatMonth(dateValue.getUTCFullYear(), dateValue.getUTCMonth() + 1);
    }

    if (typeof dateValue === 'string') {
      const match = dateValue.match(/^(\d{4})-(\d{2})-\d{2}$/);

      if (match) {
        return `${match[1]}${match[2]}`;
      }
    }

    return undefined;
  }

  static formatMonth(year: number, month: number): string {
    return `${year}${String(month).padStart(2, '0')}`;
  }
}
