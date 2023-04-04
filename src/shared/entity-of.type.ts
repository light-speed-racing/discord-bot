export type EntityOf<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
