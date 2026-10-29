<script setup>

const props = defineProps({
    options: { type: Array, required: true },
    modelValue: { type: String, default: '' }
})

const emit = defineEmits(['selection-change']);

</script>

<template>
    <select 
        :value="modelValue" 
        @change="emit('selection-change', $event.target.value)" 
    >
        <option 
            v-for="option in options" 
            :key="option.value" 
            :value="option.value" 
            :selected="modelValue === option.value"
        >
            {{ option.label }}
        </option>
    </select>
</template>

<style>
.form-filter {
    min-width: 150px;
}
</style>