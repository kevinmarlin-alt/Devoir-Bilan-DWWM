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
    <NotificationCardLayout status="inProgress">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle preview-icon">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <p class="notification-title">{{ title }}</p>
    </NotificationCardLayout>
</template>

<style>
.notification-card svg {
    color: var(--champagne)
}


</style>