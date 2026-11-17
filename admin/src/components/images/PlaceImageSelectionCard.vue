<script setup>
import { useId } from 'vue';

defineProps({
    image: { type: Object, required: true },
    selected: { type: Boolean, default: false },
    isMain: { type: Boolean, default: false },
    showMainChoice: { type: Boolean, default: false },
});

defineEmits(['add', 'remove', 'set-main']);

const radioId = useId();
</script>

<template>
    <li class="image-card">
        <figure>
            <img
                :src="`/assets/images/thumbnails/${image.filename}`"
                :alt="image.alt || ''"
                width="320"
                height="180"
            >
            <span
                v-if="selected && isMain"
                class="main-image-indicator"
                role="img"
                aria-label="Image principale"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            </span>
            <figcaption v-if="selected && showMainChoice">
                <label :for="radioId">
                    <input
                        :id="radioId"
                        type="radio"
                        name="main-image"
                        :value="image.imageId"
                        :checked="isMain"
                        @change="$emit('set-main', image.imageId)"
                    >
                    Image principale
                </label>
            </figcaption>
        </figure>
        <button
            v-if="selected"
            type="button"
            class="button-light"
            @click="$emit('remove', image.imageId)"
        >
            Retirer l’image
        </button>
        <button
            v-else
            type="button"
            class="button-secondary"
            @click="$emit('add', image.imageId)"
        >
            Ajouter l’image
        </button>
    </li>
</template>

<style scoped>
.image-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-small);
}

.image-card figure {
    position: relative;
    margin: 0;
}

.image-card img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-large);
}

.image-card figcaption {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-small);
    margin-top: var(--space-small);
    text-align: center;
}

.image-card figcaption label {
    display: flex;
    align-items: center;
    gap: var(--space-small);
}

.main-image-indicator {
    position: absolute;
    top: var(--space-small);
    right: var(--space-small);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--champagne);
    border-radius: 50%;
    background-color: var(--black-700);
    color: var(--champagne);
}

</style>
