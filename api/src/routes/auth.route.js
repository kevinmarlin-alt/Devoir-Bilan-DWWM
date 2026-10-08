import { Router } from "express";
import { currentUserHandler, loginHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post('/login', loginHandler);
authRouter.get('/user', authenticate, currentUserHandler);

export default authRouter;