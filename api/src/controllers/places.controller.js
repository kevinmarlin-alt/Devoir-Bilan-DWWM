import { getAll, deleteOnePlace } from "../services/places.service.js";

export const getAllplaces = async (req, res) => {
    const places = await getAll();

    res.status(200).json( places )
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