<script setup>
import NotificationCardLayout from '@/layouts/NotificationCardLayout.vue';
defineProps({
    title: {
        type: String,
        required: true
    },
    error: String
})
</script>

<template>
    <NotificationCardLayout status="error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert preview-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <p class="notification-title">{{ title }}</p>
        <p>{{ error }}</p>
        
        <button class="button-primary">réessayer</button>
        <RouterLink to="/admin/categories">
            <button class="button-secondary">Annuler</button>
        </RouterLink>
       
    </NotificationCardLayout>
</template>

<style scoped>
.notification-card svg {
    color: var(--red-soft)
}

.notification-card button {
    width: 100%;
}
.notification-card .button-secondary {
    background-color: transparent;
    color: var(--red-soft);
    border-color: var(--red-soft);
}
</style>