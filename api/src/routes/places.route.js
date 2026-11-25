import { Router } from "express";
import { 
    createPlace, 
    getAllplaces, 
    updatePlace, 
    deletePlace,
    getPlace,
    getMetrics,
    changeStatusPlace
} from "../controllers/places.controller.js";

const placesRouter = Router();

placesRouter.get('/', getAllplaces)
placesRouter.get('/:id', getPlace)
placesRouter.get('/:placeId/metrics', getMetrics)
placesRouter.post('/', createPlace)
placesRouter.patch('/:id', updatePlace)
placesRouter.patch('/:id/status', changeStatusPlace)
placesRouter.delete('/:id', deletePlace)

export default placesRouter;
