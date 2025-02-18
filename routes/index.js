import { Router } from "express";
import user from "./user.js";
import song from "./song.js";
const router = Router();

router.use("/user", user);
router.use("/song", song);

export default router;
