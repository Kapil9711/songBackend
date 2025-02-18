import "dotenv/config";

const config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_TIME: process.env.JWT_EXPIRES_TIME,
  JIO_BASE_URL: process.env.JIO_BASE_URL,
};

export default Object.freeze(config);
