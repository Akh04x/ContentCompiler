import { Success } from '../../shared/Result';

export class InMemoryRepository<T> {
  protected items = new Map<string, T>();

  public async save(item: T, id: string): Promise<Success<void>> {
    this.items.set(id, item);
    return new Success(undefined);
  }

  public async load(id: string): Promise<Success<T | null>> {
    return new Success(this.items.get(id) || null);
  }

  public async exists(id: string): Promise<Success<boolean>> {
    return new Success(this.items.has(id));
  }

  public async delete(id: string): Promise<Success<void>> {
    this.items.delete(id);
    return new Success(undefined);
  }

  public async findAll(): Promise<Success<T[]>> {
    return new Success(Array.from(this.items.values()));
  }
}
