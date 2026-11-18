<script setup>
defineProps({
    type: { type: String, default: 'button'}
})
</script>

<template>
    <button :type="type">
        <slot></slot>
    </button>
</template>

<style scoped>

button {
    min-height: 40px;
    padding: var(--space-small) var(--space-large);
    border-radius: var(--radius-medium);
    letter-spacing: var(--letter-space);
    background-color: var(--button-background-primary);
    text-transform: uppercase;
    color: var(--black-900);
    font-size: .7rem;
}

button:hover {
  background-color: var(--champagne-light);
}

button:disabled {
  background-color: var(--button-background-disable);
  color: var(--button-color-disable);
  cursor: default;
}
</style>