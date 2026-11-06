import { getAllImages } from '../services/images.service.js';

export const getImages = async (req, res) => {
    const images = await getAllImages();

    res.status(200).json( images );
};
