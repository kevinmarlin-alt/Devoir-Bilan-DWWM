import { getEventsPlaceById } from "../services/events.service.js";
import { isParamsExiste } from "../validators/params.validator.js"

export const getEventsPlace = async (req, res) => {
    isParamsExiste(req, ['id']);
    const events = await getEventsPlaceById(req.params.id);

    res.status(200).json(events);
}