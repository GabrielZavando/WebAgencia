export const getAuth = jest.fn().mockReturnValue({
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
    name: 'Test User',
  }),
});
export type Auth = ReturnType<typeof getAuth>;
export type DecodedIdToken = {
  uid: string;
  email?: string;
  name?: string;
};