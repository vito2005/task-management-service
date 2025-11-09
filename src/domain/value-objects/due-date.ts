export class DueDate {
  readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static from(input: string | Date): DueDate {
    const date = input instanceof Date ? input : new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid dueDate");
    }
    return new DueDate(date);
  }

  isWithinNextHours(hours: number): boolean {
    const now = new Date();
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return this.value >= now && this.value <= limit;
  }
}
