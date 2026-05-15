export class MockLocalStorage {
  private data: object;
  
  constructor() {
    this.data = {};
  }

  clear() {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  get length(): number {
    return Object.entries(this.data).length;
  }

  removeItem(key: string) {
    delete this.data[key];
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
  }
}
