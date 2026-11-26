import { Router } from "express";
import { getEventsPlace } from "../controllers/events.controller.js";

const eventsRouter = Router();

eventsRouter.get('/:id', getEventsPlace);

export default eventsRouter;