import { findAllImages, findAvailableImages } from '../repositories/images.repository.js';

export const getAllImages = async () => {
    return await findAllImages();
}

export const getAvailableImages = async () => {
    return await findAvailableImages();
}
