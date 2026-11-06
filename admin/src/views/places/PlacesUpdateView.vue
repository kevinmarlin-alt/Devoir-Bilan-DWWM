<script setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';

const route = useRoute();

const place = ref({});

onMounted(async () => {
    place.value = await getPlaceById(route.params.id);
})
</script>

<template>
    <nav class="nav-container">
        <RouterLink 
            :to="{ name: 'places_detail', params: { id: route.params.id }}"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>        
    </nav>
    <h1>Modifier un lieu</h1>
</template>