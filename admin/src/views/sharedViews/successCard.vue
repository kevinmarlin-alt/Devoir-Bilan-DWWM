<script setup>
import NotificationCardLayout from '@/layouts/NotificationCardLayout.vue';
defineProps({
    title: {
        type: String,
        required: true
    }
})
</script>

<template>
    <NotificationCardLayout status="success">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check preview-icon">
            <circle cx="12" cy="12" r="10"/>
            <path d="m16 9-5.5 5.5L8 12"/>
        </svg>
        <p class="notification-title">{{ title }}</p>        
        <RouterLink to="/admin/categories">
            <button class="button-secondary">Retour à la liste</button>
        </RouterLink>
       
    </NotificationCardLayout>
</template>

<style scoped>
.notification-card svg {
    color: var(--green-soft)
}

.notification-card a {
    width: 100%;
}


.notification-card .button-secondary {
    background-color: transparent;
    color: var(--green-soft);
    border-color: var(--green-soft);
    width: inherit;
}
</style>