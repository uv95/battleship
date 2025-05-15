import { v4 as uuidV4 } from 'uuid';

export default class Database<T extends { id: string }> {
  private store: T[];

  constructor() {
    this.store = [];
  }

  getAll() {
    return this.store;
  }

  findById(id: string) {
    return this.store.find((item) => item.id === id);
  }

  findOne(query: Partial<T>) {
    return this.store.find((item) =>
      Object.keys(query).every(
        (key) => item[key as keyof T] === query[key as keyof T]
      )
    );
  }

  create(data: Omit<T, 'id'>) {
    const id = uuidV4();
    const newItem = {
      id,
      ...data,
    } as T;

    this.store.push(newItem);

    return newItem;
  }

  updateOne(id: string) {}

  deleteOne(id: string) {}
}
