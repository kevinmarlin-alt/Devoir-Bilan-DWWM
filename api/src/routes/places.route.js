import { Router } from "express";
import { getAllplaces } from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)

export default placesRouter;