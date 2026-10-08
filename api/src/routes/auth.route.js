import { Router } from "express";
import { currentUserHandler, loginHandler, logoutHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post('/login', loginHandler);
authRouter.get('/me', authenticate, currentUserHandler);
authRouter.post('/logout', authenticate, logoutHandler);

export default authRouter;