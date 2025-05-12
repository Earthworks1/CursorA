export const configurationApi = {
  getConfig: async () => ({ theme: "light", language: "fr", timezone: "Europe/Paris", notifications: true }),
  updateConfig: async (_newConfig: Record<string, unknown>) => ({}),
}; 