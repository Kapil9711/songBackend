import express from "express";
import { createServer } from "http";
import "dotenv/config";
import ConnectDB from "./config/db.js";
import config from "./config/secret.js";
import cors from "cors";
import globalErrorHandler from "./middlewares/gloablErrorHandler.js";
import router from "./routes/index.js";
import { Server } from "socket.io";
// import initializeSocket from "./socket.js";

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// export const io = new Server(httpServer, {
//   cors: {
//     origin: "*",
//   },
// });

// initializeSocket(io);

app.use("/", router);

app.get("/", (req, res) => {
  return res.status(200).json({ success: true, message: "api is working" });
});

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
