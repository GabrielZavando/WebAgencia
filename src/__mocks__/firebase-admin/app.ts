export const initializeApp = jest.fn().mockReturnValue({
  delete: jest.fn().mockResolvedValue(undefined),
});
export const deleteApp = jest.fn().mockResolvedValue(undefined);
export const cert = jest.fn().mockReturnValue({});
export const getApp = jest.fn();
export const getApps = jest.fn().mockReturnValue([]);
export const App = class MockApp {
  delete = jest.fn().mockResolvedValue(undefined);
};