<script setup>

import NotificationCardLayout from '@/layouts/NotificationCardLayout.vue';
defineProps({
    slug: String
})

</script>

<template>
    <NotificationCardLayout status="success">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check preview-icon">
            <circle cx="12" cy="12" r="10"/>
            <path d="m16 9-5.5 5.5L8 12"/>
        </svg>
        <p class="notification-title">Le lieu à bien été publié !</p>   
        <p>Le lieu est désormais visible dans le catalogue public.</p>     
        <a type="button" class="button-primary" :href="`/${slug}`" target="_blank">
            Voir le lieu
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-arrow-out-up-right preview-icon">
                <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/>
                <path d="m21 3-9 9"/>
                <path d="M15 3h6v6"/>
            </svg>
        </a>
        <RouterLink :to="{name: 'places_home'}">
            <button type="button" class="button-secondary">Retour à la liste</button>
        </RouterLink>
    </NotificationCardLayout>
</template>

<style scoped>
.notification-card > svg {
    color: var(--green-soft)
}

.button-primary {
    justify-content: center;
}
.button-secondary {
    background-color: transparent;
    color: var(--green-soft);
    border-color: var(--green-soft);
    width: inherit;
}

.button-secondary:hover {
    background-color: var(--green-soft);
    color: var(--black-500);
}

a svg {
    margin-left: 10px;
}
</style>