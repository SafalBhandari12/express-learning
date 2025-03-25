import { Router } from "express";

import porudctRouter from "./products.js";
import usersRouter from "./users.js";

const router = Router();

router.use(porudctRouter);
router.use(usersRouter);

export default router;
