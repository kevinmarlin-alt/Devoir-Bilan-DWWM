<script setup>
defineProps({
    source: { 
        type: Object,
        default: {
            imageId: null,
            slug: '',
            filename: '',
            alt: '',
            isMain: false,
        }
    }
})
</script>

<template>
    <figure>
        <!-- <figcaption>{{ source.alt }}</figcaption> -->
        <img 
            :src="`/assets/images/thumbnails/${source.filename}` || ''" 
            :alt="source?.alt || ''"
            width="180"
            height="180"
            loading="lazy"
        >
    </figure>
</template>

<style scoped>
figure {
    max-width: 180px;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: var(--card-background);
    border-radius: var(--radius-large);
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>