<script setup>
defineProps({
    description: String,
    value: Number
})
</script>

<template>
    <div class="metric-card">
        <p>{{ description }}</p>
        <span>{{ value }}</span>
    </div>
</template>

<style>
.metric-card {
    background-color: var(--metric-background);
    border: 1px solid var(--metrics-border-color);
    font-size: 0.75rem;
    padding: 1em;
    border-radius: 1em;
    min-width: 250px;
}

span {
    display: inline-block;
    font-family: "Baskervville Regular", serif;
    font-size: 3rem;
    color: var(--metrics-value-color);
    width: 100%;
    text-align: end;
}

</style>