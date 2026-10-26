import { getAll } from "../services/places.service.js";

export const getAllplaces = async (req, res) => {
    const places = await getAll();

    res.status(200).json( places )
}