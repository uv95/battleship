import { v4 as uuidV4 } from 'uuid';

export default class Database<T extends { id: string | number }> {
  private store: T[];

  constructor() {
    this.store = [];
  }

  getAll() {
    return this.store;
  }

  findById(id: string | number) {
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
      ...data,
      id,
    } as T;

    this.store.push(newItem);

    return newItem;
  }

  updateOne(id: string | number, newData: Partial<T>) {
    const itemToUpdate = this.findById(id);
    const updatedItem = { ...itemToUpdate, ...newData } as T;

    this.store = this.store.map((item) =>
      item.id === id ? updatedItem : item
    );

    return updatedItem;
  }

  deleteOne(id: string | number) {
    this.store = this.store.filter((item) => item.id !== id);
  }
}
