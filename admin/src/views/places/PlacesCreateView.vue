<script setup>
import { onMounted, ref, computed } from 'vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import FormPlaces from '@/components/FormPlaces.vue';
import router from '@/router';
import { getAllCategories } from '@/services/categories.service.js'
import { createPlace, getAllImages } from '@/services/places.service.js';
import { getAll } from '@/services/exploitationTypes.service';
import RegistrationStatus from '@/components/RegistrationStatus.vue';

const currentStep = ref(1);
const data = ref({});
const categories = ref([]);
const types = ref([]);
const images = ref([]);
const registrationStatus = ref(false);

const cancelHandler = () => {
    router.push({ name: 'places_home'})
}

const createHandler = async (status) => {
    const place = await createPlace({
        name: data.value.name,
        description: data.value.description,
        categoryId: data.value.category,
        exploitationTypeIds: data.value.types,
        imageIds: data.value.images,
        status
    });

    return place;
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

const changeStep = (step) => {
    currentStep.value = step;
}

onMounted(async () => {
    categories.value = await getAllCategories();
    types.value = await getAll();
    images.value = await getAllImages();
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
        <button v-if="currentStep < 3" type="button" class="button-secondary" :disabled="!data.name" @click="createHandler('draft')">Enregistrer</button>
        <button v-else type="button" class="button-primary" :disabled="!isPublishable" @click="createHandler('published')">Publier</button>
    </nav>
    <h1>Nouveau lieu</h1>
    <ProgressBarCreatePlace :current-step="currentStep" @selected-step="v => changeStep(v)"/>
    
    <FormPlaces 
        :current-step="currentStep"
        :categories="categories"
        :types="types"
        :images="images"
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
            @click="createHandler('published')"
        >
            Publier
        </button>
    </div>
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
