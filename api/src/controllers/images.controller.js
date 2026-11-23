import { getAllImages, getAvailableImages as getAvailableImagesService } from '../services/images.service.js';

export const getImages = async (req, res) => {
    const images = await getAllImages();

    res.status(200).json( images );
};

export const getAvailableImages = async (req, res) => {
    const images = await getAvailableImagesService();

    res.status(200).json(images);
};
