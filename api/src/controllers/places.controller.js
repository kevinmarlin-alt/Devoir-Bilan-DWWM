import { createOnePlace, getAll, deleteOnePlace } from "../services/places.service.js";
import { AppError } from '../errors/AppError.js';
import { validatePlacePayload } from '../validators/place.validator.js';

export const getAllplaces = async (req, res) => {
    const places = await getAll();

    res.status(200).json( places )
}

export const createPlace = async (req, res) => {
    const data = validatePlacePayload(req.body);
    const place = await createOnePlace(data);

    res.status(201).json(place);
}

export const deletePlace = async (req, res) => {
    if(!req.params.id) {
        throw new AppError('Le paramettre "id" de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }

    const placeId = req.params.id;

    await deleteOnePlace(placeId);

    res.sendStatus(200)
}
