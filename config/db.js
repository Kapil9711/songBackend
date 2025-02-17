import mongoose from "mongoose";
import config from "./secret.js";

const { MONGO_URI } = config;
const ConnectDB = async () => {
  await mongoose.connect(MONGO_URI);
};

export default ConnectDB;
