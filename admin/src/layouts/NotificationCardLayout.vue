<script>
const STATUS = [
    'inProgress',
    'success',
    'error',
    'warning'
]

const FLEX_OPTIONS = [
    'column',
    'row'
]
</script>

<script setup>
defineProps({
    status: {
        type: String,
        required: true,
        validator: value => STATUS.includes(value)
    },
    flexDirection: {
        type: String,
        required: false,
        default: 'column',
        validator: value => FLEX_OPTIONS.includes(value)
    }
})
</script>

<template>
    <div :class="`notification-card notification-${status} flex-${flexDirection}`">
        <slot></slot>
    </div>
</template>

<style>
.notification-card {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: var(--space-medium);
    padding: var(--space-large);
    border-radius: var(--radius-large);
    width: 100%;
}

.flex-column {
    flex-direction: column;
}

.flex-row {
    flex-direction: row;
    justify-content:space-between;
}

.notification-title {
    font-family: "Baskervville Regular", serif;
    font-size: 2rem;
}

.notification-inProgress {
    background-color: var(--card-background);
    border: 1px solid var(--card-border);
}

.notification-success {
    background-color: var(--success-background);
    border: 1px solid var(--success-border);
}

.notification-error {
    background-color: var(--error-background);
    border: 1px solid var(--error-border);
}

.notification-warning {
    background-color: var(--warning-background);
    border: 1px solid var(--warning-border);
}

</style>