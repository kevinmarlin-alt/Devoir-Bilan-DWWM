import { Router } from "express";
import { createPlace, getAllplaces, updatePlace, deletePlace } from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)
placesRouter.post('/', createPlace)
placesRouter.patch('/:id', updatePlace)
placesRouter.delete('/:id', deletePlace)

export default placesRouter;
