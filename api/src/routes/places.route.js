import { Router } from "express";
import { getAllplaces, deletePlace } from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)
placesRouter.delete('/:id', deletePlace)

export default placesRouter;