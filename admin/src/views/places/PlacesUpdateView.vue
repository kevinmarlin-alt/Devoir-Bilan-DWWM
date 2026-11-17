<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { getPlaceById } from '@/services/places.service.js'
import FormPlaces_V2 from '@/components/FormPlaces_V2.vue';

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
    <FormPlaces_V2
        :place="place"
        :current-step="2"
    />
</template>