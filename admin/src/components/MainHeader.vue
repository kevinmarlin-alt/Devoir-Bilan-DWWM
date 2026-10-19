<script setup>
defineProps({
    title: { type: String, required: true },
    data: { type: Boolean, required: true },
    button: { type: String, required: true }
})

const emit = defineEmits(['addOne']);

</script>

<template>
    <div class="main-header">
        <h1>{{ title }}</h1>
        <button v-if="data" 
            class="button-primary"
            @click="emit('addOne')"
        >
            {{ button }}
        </button>
    </div>
</template>

<style>
.main-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
}
</style>