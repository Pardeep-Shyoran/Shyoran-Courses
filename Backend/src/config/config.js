import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "",
};

export default Object.freeze(_config);
