<script setup>
import { ref, watch } from 'vue';
import ImagePlace from '../ImagePlace.vue';

defineProps({
    images: {
        type: Array,
        default: []
    }

})

const emits = defineEmits(['images-selected', 'main-id'])

const selectedImages = ref([]);
const mainImageId = ref(null);

const toggleImage = (imageId) => {
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

watch([selectedImages, mainImageId], () => {
    emits('images-selected', selectedImages.value);
    emits('main-id', mainImageId.value);
})

const setMainImage = (imageId) => {
    mainImageId.value = imageId;
};
</script>

<template>
    <div class="container-images">
        <p v-if="images.length === 0">Aucune image disponible.</p>
        <ImagePlace
            v-for="image in images"
            :key="image.imageId"
            :source="image"
            :selected="selectedImages.includes(image.imageId)"
            :is-main="mainImageId === image.imageId"
            @image="toggleImage"
            @main-image="setMainImage"
        />
    </div>
</template>

<style scoped>
.container-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-medium);
    width: 100%;
}
</style>