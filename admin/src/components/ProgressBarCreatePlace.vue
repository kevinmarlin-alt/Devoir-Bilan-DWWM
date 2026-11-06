<script setup>
defineProps({
    currentStep: {
        type: Number,
        required: true,
        validator: (value) => value >= 1 && value <= 3,
    },
});

const steps = [
    { title: 'Information' },
    { title: 'Photographies' },
    { title: 'Publication' },
];

const emits = defineEmits(['selected-step'])

</script>

<template>
    <div class="progress_bar">
        <template v-for="(step, index) in steps" :key="step.title">
            <div v-if="index > 0" class="step_line" :class="{ active_step: index < currentStep }"></div>
            <div class="step">
                <div    
                    class="step_number" :class="{ active_step: index < currentStep }"
                    @mousedown="index < currentStep ? emits('selected-step', index + 1) : null"
                >
                    {{ index + 1 }}
                </div>
                <p class="step_title">
                    {{ step.title }}
                </p>
            </div>
        </template>
    </div>

</template>

<style scoped>
.progress_bar {
    display: flex;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
}

.step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;

}

.step_number {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 50px;
    border-radius: 100%;
    background-color: var(--black-500);
    font-size: 1.5rem;    
}

.step_title {
    position: absolute;
    bottom: -1.5rem;
    font-size: .8rem;
}

.step_line {
    height: 5px;
    flex: auto;
    background-color: var(--black-500);
}

.active_step {
    background-color: var(--champagne);
    color: var(--black-900);
}
</style>
