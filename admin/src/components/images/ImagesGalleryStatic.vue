<script setup>
import { ref, watch } from 'vue';
import ImagePlace from '../ImagePlace.vue';

defineProps({
    images: {
        type: Array,
        default: []
    }

})



</script>

<template>
    <div class="container-images">
        <p v-if="images.length === 0">Aucune image disponible.</p>
        <ImagePlace
            v-for="image in images"
            :key="image.imageId"
            :source="image"
            :is-main="image.isMain"
            :locked="true"
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