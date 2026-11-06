import { findAllImages } from '../repositories/images.repository.js';

export const getAllImages = async () => {
    return await findAllImages();
}
