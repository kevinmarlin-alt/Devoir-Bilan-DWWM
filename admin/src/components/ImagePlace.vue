<script setup>
const props = defineProps({
    source: Object,
    selected: Boolean
})

const emits = defineEmits(['image']);

const clickHandler = () => {
    emits('image', props.source?.id)
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
        <!-- <img src="/assets/images/connexion-background.jpg" alt="xcxgn"> -->
    </button>
</template>

<style scoped>
.place_image {
    height: 200px;
    width: 200px;
    background-color: grey;
    border-radius: var(--radius-large);
}

.place_image img {
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-large);
}

.place_image--selected {
    outline: 2px solid var(--champagne);
    outline-offset: 3px;
}
</style>
