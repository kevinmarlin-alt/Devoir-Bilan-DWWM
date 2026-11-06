import { ref } from 'vue';

export const toggleImage = (imageId) => {
    const imageIndex = selectedImages.value.indexOf(imageId);

    if (imageIndex === -1) {
        selectedImages.value.push(imageId);
        return;
    }

    selectedImages.value.splice(imageIndex, 1);

    if (mainImageId.value === imageId) {
        mainImageId.value = null;
    }
};