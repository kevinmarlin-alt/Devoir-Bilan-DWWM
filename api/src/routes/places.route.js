import { Router } from "express";
import { 
    createPlace, 
    getAllplaces, 
    updatePlace, 
    deletePlace,
    getPlace
} from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)
placesRouter.get('/:id', getPlace)
placesRouter.post('/', createPlace)
placesRouter.patch('/:id', updatePlace)
placesRouter.delete('/:id', deletePlace)

export default placesRouter;
