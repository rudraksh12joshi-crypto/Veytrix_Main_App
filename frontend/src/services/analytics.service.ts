// Analytics service - event tracking integration to be implemented.
export const analyticsService = {
  track: async (_event: string, _properties?: Record<string, unknown>) => {
    throw new Error("Not implemented");
  },
  identify: async (_userId: string, _traits?: Record<string, unknown>) => {
    throw new Error("Not implemented");
  },
  getSummary: async () => {
    throw new Error("Not implemented");
  },
};
