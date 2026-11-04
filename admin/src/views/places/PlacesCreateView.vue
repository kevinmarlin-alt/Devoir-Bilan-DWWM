<script setup>
import { onMounted, ref } from 'vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import FormPlaces from '@/components/FormPlaces.vue';
import router from '@/router';
import { getAllCategories } from '@/services/categories.service.js'
import { getAll } from '@/services/exploitationTypes.service';

const currentStep = ref(1);
const data = ref({});
const categories = ref([]);
const types = ref([]);

const cancelHandler = () => {
    router.push({ name: 'places_home'})
}

const nextStepHandler = () => {
    currentStep.value++
}

onMounted(async () => {
    categories.value = await getAllCategories();
    types.value = await getAll();
})
</script>

<template>
    <nav class="nav-container">
        <RouterLink 
            to="/admin/places"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>
        <button v-if="currentStep < 3" type="button" class="button-secondary" :disabled="!data.name">Enregistrer</button>
        <button v-else type="button" class="button-primary">Publier</button>
    </nav>
    <h1>Nouveau lieu</h1>
    <ProgressBarCreatePlace :current-step="currentStep"/>
    
    <FormPlaces 
        :current-step="currentStep"
        :categories="categories"
        :types="types"
        @data-form="value => data = {...value}"
    />
    <div class="button-group">
        <div class="registration-status">
            <span></span>Non enregistrée
        </div>
        <button class="button-secondary" @click="cancelHandler">
            Annuler
        </button>
        <button 
            v-if="currentStep < 3"
            class="button-primary"
            :disabled="!data.name"
            @click="nextStepHandler"
        >
            Suivant
        </button>
        <button 
            v-else
            class="button-primary"
            :disabled="!data.name"
            @click="createHandler"
        >
            Publier
        </button>
    </div>
    {{ data }}
</template>

<style>
.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: end;
}

.progress_bar {
    padding: 0 3rem;
    width: auto;
}
</style>
