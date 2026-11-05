import { Image } from '../models/Image.js';

export const findAllImages = async () => {
    return await Image.findAll({
        where: { placeId: null }
    })
};

export const findImageById = async (imageId) => {
    return await Image.findOne({
        where: { imageId }
    });
};

export const assignImagesToPlace = async ({ imageIds, mainImageId, placeId }, transaction) => {
    for (let index = 0; index < imageIds.length; index++) {
        await Image.update({
            placeId,
            isMain: imageIds[index] === mainImageId
        }, {
            where: { imageId: imageIds[index] },
            transaction
        });
    }
};

export const clearImagesFromPlace = async (placeId, transaction) => {
    await Image.update({
        placeId: null,
        isMain: false
    }, {
        where: { placeId },
        transaction
    });
};
