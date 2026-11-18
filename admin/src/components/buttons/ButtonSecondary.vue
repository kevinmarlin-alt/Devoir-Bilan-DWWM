<script setup>
defineProps({
    type: { type: String, default: 'button'},
    variant: {
      type: String, 
      default: 'default',
      validator(value) {
          return ['default', 'success', 'warning', 'error'].includes(value)
      }
    }
})
</script>

<template>
    <button :type="type" :class="`button--${variant}`">
        <slot></slot>
    </button>
</template>

<style scoped>

button {
  min-height: 40px;
  padding: var(--space-small) var(--space-large);
  border-radius: var(--radius-medium);
  background-color: transparent;
  border: 1px solid;
  cursor: pointer;
}

/* Variante par défaut */
.button--default {
  color: var(--button-secondary-color);
  border-color: var(--input-border-color);
}

.button--default:hover {
  background-color: var(--button-background-secondary-hover);
}

/* Succès */
.button--success {
  color: var(--success-color);
  border-color: var(--success-border);
  background-color: var(--success-background);
}

.button--success:hover {
  color: white;
  background-color: var(--success-border);
}

/* Avertissement */
.button--warning {
  color: var(--warning-color);
  border-color: var(--warning-border);
  background-color: var(--warning-background);
}

.button--warning:hover {
  color: white;
  background-color: var(--warning-color);
}

/* Erreur ou action dangereuse */
.button--error {
  color: var(--error-color);
  border-color: var(--error-border);
  background-color: var(--error-background);
}

.button--error:hover {
  color: white;
  background-color: var(--error-color);
}

button:disabled {
  color: var(--button-color-disable);
  background-color: var(--black-500);
  border-color: var(--black-500);
  cursor: default;
}
</style>