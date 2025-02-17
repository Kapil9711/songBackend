import express from "express";
import { createServer } from "http";
import "dotenv/config";
import ConnectDB from "./config/db.js";
import config from "./config/secret.js";
import cors from "cors";
import globalErrorHandler from "./middlewares/gloablErrorHandler.js";
import router from "./routes/index.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

app.use(globalErrorHandler);

const { PORT } = config;

const start = async () => {
  try {
    await ConnectDB();
    console.log("connected to Mongodb");
    httpServer.listen(PORT, () => {
      console.log("server is listening on port ", PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
