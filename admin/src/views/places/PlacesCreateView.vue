<script setup>
import { onMounted, ref, computed } from 'vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import FormPlaces from '@/components/FormPlaces.vue';
import router from '@/router';
import { getAllCategories } from '@/services/categories.service.js'
import { getAll } from '@/services/exploitationTypes.service';
import RegistrationStatus from '@/components/RegistrationStatus.vue';

const currentStep = ref(1);
const data = ref({});
const categories = ref([]);
const types = ref([]);
const registrationStatus = ref(false);

const cancelHandler = () => {
    router.push({ name: 'places_home'})
}

const nextStepHandler = () => {
    currentStep.value++
}

const isPublishable = computed(() => {
    const hasName = data.value.name !== '';
    const hasDescription = data.value.description !== '';
    const hasCategory = data.value.category !== '';
    const hasTypes = data.value.types?.length > 0;
    const hasImages = data.value.images?.length >= 1;

    return hasName && hasDescription && hasCategory && hasTypes && hasImages
})

const isRegistrable = computed(() => {
    return data.value.name !== '';
})

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
        <button v-else type="button" class="button-primary" :disabled="!isPublishable">Publier</button>
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
        <RegistrationStatus :is-saved="registrationStatus"/>
        <button class="button-secondary" @click="cancelHandler">
            Annuler
        </button>
        <button 
            v-if="currentStep < 3"
            class="button-primary"
            :disabled="!isRegistrable"
            @click="nextStepHandler"
        >
            Suivant
        </button>
        <button 
            v-else
            class="button-primary"
            :disabled="!isPublishable"
            @click="createHandler"
        >
            Publier
        </button>
    </div>
    {{ data }}
    {{ isPublishable }}
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
