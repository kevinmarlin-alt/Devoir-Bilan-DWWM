import { validatePlacePayload } from '../validators/place.validator.js';
import { isParamsExiste, validatePositiveIntegerParam } from '../validators/params.validator.js'
import { 
    createOnePlace, 
    getAll, 
    updateOnePlace, 
    deleteOnePlace,
    getOnePlaceById,
    updateStatus
} from "../services/places.service.js";
import { isBodyExiste } from '../validators/body.validator.js';
import { AppError } from '../errors/AppError.js';
import { getPlaceMetrics } from '../services/placeMetrics.service.js';

export const getAllplaces = async (req, res) => {
    const places = await getAll();

    res.status(200).json( places )
}

export const getPlace = async (req, res) => {
    isParamsExiste(req, ['id']);
    const place = await getOnePlaceById(req.params.id);

    res.status(200).json( place )
}

export const getMetrics = async (req, res) => {
    const placeId = validatePositiveIntegerParam(req.params.placeId, 'placeId');
    if (!Number.isSafeInteger(placeId)) {
        throw new AppError('Identifiant de lieu invalide.', { status: 400, code: 'INVALID_PLACE_ID' });
    }

    res.status(200).json(await getPlaceMetrics(placeId));
};

export const createPlace = async (req, res) => {
    const data = validatePlacePayload(req.body);
    const place = await createOnePlace(data);

    res.status(201).json(place);
}

export const updatePlace = async (req, res) => {
    const placeId = validatePositiveIntegerParam(req.params.id);
    const data = validatePlacePayload(req.body);
    const place = await updateOnePlace(placeId, data);

    res.status(200).json(place);
}

export const changeStatusPlace = async (req, res) => {
    isBodyExiste(req, ['status']);
    isParamsExiste(req, ['id']);
    const placeId = req.params.id;
    const status = req.body.status;
    
    const place = await updateStatus(placeId, status);
    res.status(200).json(place)
}

export const deletePlace = async (req, res) => {
    isParamsExiste(req, ['id']);
    const placeId = req.params.id;

    await deleteOnePlace(placeId);

    res.status(204).send();
}
