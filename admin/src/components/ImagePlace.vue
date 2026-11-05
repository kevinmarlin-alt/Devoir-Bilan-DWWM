<script setup>
const props = defineProps({
    source: Object,
    selected: Boolean
})

const emits = defineEmits(['image']);

const thumbnailPath = (filename) => `/assets/images/thumbnails/${filename}`;

const clickHandler = () => {
    emits('image', props.source?.imageId)
}
</script>

<template>
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
</template>

<style scoped>
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

@media (prefers-reduced-motion: reduce) {
    .place_image,
    .place_image img {
        transition: none;
    }
}
</style>
