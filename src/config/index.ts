const APP_CONFIG = {
  API_VERSION: process.env.API_VERSION || "v1",
  PORT: process.env.PORT || 8000,
  DB_CONNECTION_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default APP_CONFIG;
