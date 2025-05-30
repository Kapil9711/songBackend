import { Router } from "express";
import user from "./user.js";
import song from "./song.js";
import friend from "./friend.js";
import favorite from "./favorite.js";
import playlist from "./playlist.js";
const router = Router();

router.use("/user", user);
router.use("/song", song);
router.use("/friend", friend);
router.use("/favorite", favorite);
router.use("/playlist", playlist);

export default router;
