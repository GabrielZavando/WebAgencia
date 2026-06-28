export const getFirestore = jest.fn().mockReturnValue({
  collection: jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true, id: 'mock-id', data: jest.fn().mockReturnValue({}) }),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
    add: jest.fn().mockResolvedValue({ id: 'mock-new-id' }),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }),
    }),
  }),
  listCollections: jest.fn().mockResolvedValue([]),
});
export type Firestore = ReturnType<typeof getFirestore>;