// Authentication service - API integration to be implemented.
export const authService = {
  login: async (_email: string, _password: string) => {
    throw new Error("Not implemented");
  },
  register: async (_email: string, _password: string, _displayName: string) => {
    throw new Error("Not implemented");
  },
  logout: async () => {
    throw new Error("Not implemented");
  },
  refresh: async () => {
    throw new Error("Not implemented");
  },
  requestPasswordReset: async (_email: string) => {
    throw new Error("Not implemented");
  },
};
