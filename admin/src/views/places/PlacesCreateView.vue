<script setup>
import { onMounted, ref, computed } from 'vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import FormPlaces from '@/components/FormPlaces.vue';
import router from '@/router';
import { getAllCategories } from '@/services/categories.service.js'
import { createPlace, getAllImages, updatePlace } from '@/services/places.service.js';
import { getAllExploitationTypes } from '@/services/exploitationTypes.service.js';
import RegistrationStatus from '@/components/RegistrationStatus.vue';
import inProgressCard from '@/views/sharedViews/inProgressCard.vue';
import errorCard from '@/views/sharedViews/errorCard.vue';

const currentStep = ref(1);
const data = ref({});
const categories = ref([]);
const types = ref([]);
const images = ref([]);
const registrationStatus = ref(false);
const publishedPlace = ref(null);
const draftPlace = ref(null);
const requestStatus = ref(null);
const errorMessage = ref('');
const lastActionStatus = ref(null);

const cancelHandler = () => {
    router.push({ name: 'places_home'})
}

const createHandler = async (status) => {
    requestStatus.value = 'inProgress';
    lastActionStatus.value = status;

    try {
        const placeData = {
            name: data.value.name,
            description: data.value.description,
            categoryId: data.value.category,
            exploitationTypeIds: data.value.types,
            imageIds: data.value.images,
            mainImageId: data.value.mainImageId,
            status
        };

        const place = draftPlace.value
            ? await updatePlace(draftPlace.value.placeId, placeData)
            : await createPlace(placeData);

        if (status === 'draft') {
            draftPlace.value = place;
            registrationStatus.value = true;
            requestStatus.value = null;
        }

        if (status === 'published') {
            publishedPlace.value = place;
            requestStatus.value = 'success';
        }
    } catch (error) {
        errorMessage.value = error.message;
        requestStatus.value = 'error';
    }
}

const retryHandler = () => {
    createHandler(lastActionStatus.value);
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
    const hasMainImage = data.value.mainImageId !== null;

    return hasName && hasDescription && hasCategory && hasTypes && hasImages && hasMainImage
})

const isRegistrable = computed(() => {
    return data.value.name !== '';
})

const isSaving = computed(() => requestStatus.value === 'inProgress');

const changeStep = (step) => {
    currentStep.value = step;
}

onMounted(async () => {
    categories.value = await getAllCategories();
    types.value = await getAllExploitationTypes();
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
        <button v-if="currentStep < 3" type="button" class="button-secondary" :disabled="!data.name || isSaving" @click="createHandler('draft')">Enregistrer</button>
        <button v-else-if="requestStatus !== 'success'" type="button" class="button-primary" :disabled="!isPublishable || isSaving" @click="createHandler('published')">Publier</button>
    </nav>
    <h1>Nouveau lieu</h1>
    <ProgressBarCreatePlace :current-step="currentStep" @selected-step="v => changeStep(v)"/>
    
    <FormPlaces 
        :current-step="currentStep"
        :categories="categories"
        :types="types"
        :images="images"
        :status="requestStatus"
        :place="publishedPlace"
        @data-form="value => data = {...value}"
    />
    <inProgressCard
        v-if="requestStatus === 'inProgress'"
        title="Enregistrement en cours..."
    />
    <errorCard
        v-else-if="requestStatus === 'error'"
        title="Échec de l'enregistrement"
        :error="errorMessage"
        cancel-path="/admin/places"
        @retry="retryHandler"
        @cancel="cancelHandler"
    />
    <div v-if="requestStatus !== 'success'" class="button-group">
        <RegistrationStatus :is-saved="registrationStatus"/>
        <button class="button-secondary" @click="cancelHandler">
            Annuler
        </button>
        <button 
            v-if="currentStep < 3"
            class="button-primary"
            :disabled="!isRegistrable || isSaving"
            @click="nextStepHandler"
        >
            Suivant
        </button>
        <button 
            v-else
            class="button-primary"
            :disabled="!isPublishable || isSaving"
            @click="createHandler('published')"
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
