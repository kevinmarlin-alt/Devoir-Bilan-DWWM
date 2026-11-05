<script setup>
const props = defineProps({
    source: Object,
    selected: Boolean,
    isMain: Boolean
})

const emits = defineEmits(['image', 'main-image']);

const thumbnailPath = (filename) => `/assets/images/thumbnails/${filename}`;

const clickHandler = () => {
    emits('image', props.source?.imageId)
}

const setMainImage = () => {
    emits('main-image', props.source?.imageId)
}
</script>

<template>
    <div class="place-image-container">
        <button
            type="button"
            class="place_image"
            :class="{ 'place_image--selected': selected }"
            :aria-pressed="selected"
            @click="clickHandler"
        >
            <img
                :src="thumbnailPath(source?.filename)"
                :alt="source?.alt || ''"
                width="320"
                height="180"
                loading="lazy"
                decoding="async"
            >
        </button>
        <button
            v-if="selected"
            type="button"
            class="main-image-button"
            :class="{ 'main-image-button--selected': isMain }"
            :aria-label="isMain ? 'Photo principale' : 'Définir comme photo principale'"
            @click="setMainImage"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        </button>
    </div>
</template>

<style scoped>
.place-image-container {
    position: relative;
}

.place_image {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background-color: var(--card-background);
    cursor: pointer;
    border-radius: var(--radius-large);
    transition: transform 160ms ease, box-shadow 160ms ease, outline-color 160ms ease;
}

.place_image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-large);
    transition: transform 160ms ease;
}

.place_image:hover,
.place_image:focus-visible {
    transform: translateY(-2px);
    /* box-shadow: 0 0 0 3px #83b8ff, 0 8px 18px rgb(0 0 0 / 25%); */
}

.place_image:hover img,
.place_image:focus-visible img {
    transform: scale(1.03);
}

.place_image:focus-visible {
    outline: 3px solid #83b8ff;
    outline-offset: 4px;
}

.place_image--selected {
    outline: 2px solid var(--champagne);
    outline-offset: 3px;
}

.main-image-button {
    position: absolute;
    top: var(--space-small);
    right: var(--space-small);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--champagne);
    background-color: var(--black-900);
    color: var(--champagne);
}

.main-image-button--selected {
    background-color: var(--champagne);
    color: var(--black-900);
}

@media (prefers-reduced-motion: reduce) {
    .place_image,
    .place_image img {
        transition: none;
    }
}
</style>
