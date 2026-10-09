<script setup>

const props = defineProps({
    for: String,
    label: String
})

</script>

<template>
    <div>
        <label :for="for">{{ label }}</label>
        <input 
            type="email" 
            name="email" 
            id="email"
            placeholder="exemple@email.fr"
            value=""
        >
    </div>
</template>