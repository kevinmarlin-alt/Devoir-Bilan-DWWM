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
        <div v-if="source.isMain">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star preview-icon">
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
            </svg>
        </div>
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
    position: relative;
    max-width: 180px;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    background-color: var(--card-background);
    border-radius: var(--radius-large);
}

div {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    background-color: var(--black-700);
    border-radius: 50px;
    
}

div svg {
    color: var(--champagne);
}



img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>