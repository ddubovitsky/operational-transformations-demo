export class DoubleMap {
  map = new Map();

  set(keyA: any, keyB: any, data: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    secondMap.set(keyB, data);
    this.map.set(keyA, secondMap);
  }

  get(keyA: any, keyB: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    return secondMap.get(keyB);
  }

  has(keyA: any, keyB: any) {
    const secondMap = this.map.get(keyA) ?? new Map();
    return secondMap.has(keyB);
  }
}
