export class MockLocalStorage {
  private data: object;
  
  constructor() {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  setItem(key: string, value: string) {
    this.data[key] = value;
  }
}
