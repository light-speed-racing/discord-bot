export type EntityOf<T> = Partial<Omit<T, 'createdAt' | 'updatedAt'>>;
