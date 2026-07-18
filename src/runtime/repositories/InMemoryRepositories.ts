import { Success } from '../../shared/Result';

export class InMemoryRepository<T> {
  protected items = new Map<string, T>();
  
  async save(item: T, idKey: keyof T | ((item: T) => string)): Promise<Success<void>> {
    const id = typeof idKey === 'function' ? idKey(item) : (item as any)[idKey].value;
    this.items.set(id, item);
    return new Success(undefined);
  }
}
