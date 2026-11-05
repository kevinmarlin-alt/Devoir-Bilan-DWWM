import { Router } from "express";
import { createPlace, getAllplaces, deletePlace } from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)
placesRouter.post('/', createPlace)
placesRouter.delete('/:id', deletePlace)

export default placesRouter;
