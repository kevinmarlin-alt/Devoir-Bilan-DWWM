<script setup>
import NotificationCardLayout from '@/layouts/NotificationCardLayout.vue';

const emit = defineEmits(['confirm', 'cancel']);

defineProps({
    title: {
        type: String,
        required: true
    },
    flexDirection: {
        type: String,
        required: false,
        default: 'column'
    }
})
</script>

<template>
    <NotificationCardLayout 
        status="warning" 
        :flex-direction="flexDirection"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert preview-icon">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <div class="notification__wrapper">
            <p class="notification-title">{{ title }}</p>
            <p>Cette action sera définitive.</p>
        </div>
        <p>Souhaitez-vous confirmer cette action ?</p>
        <button class="button-secondary" @click="emit('cancel')">Non</button>
        <button class="button-primary" @click="emit('confirm')">Oui</button>
    </NotificationCardLayout>
</template>

<style scoped>
.notification-card svg {
    color: var(--amber-warm)
}

.notification__wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-medium);
    max-width: 300px;
}

.button__wrapper {
    display: flex;
}

.notification-card button {
    width: 100%;
    max-width: 200px;
}
.notification-card .button-secondary {
    background-color: transparent;
    color: var(--amber-warm);
    border-color: var(--amber-warm);
}
</style>