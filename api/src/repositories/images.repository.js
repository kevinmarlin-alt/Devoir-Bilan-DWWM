import { Image } from '../models/Image.js';

export const findAllImages = async () => {
    return await Image.findAll()
};
