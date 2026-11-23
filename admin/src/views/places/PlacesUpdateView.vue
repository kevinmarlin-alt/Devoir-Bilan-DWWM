<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import FormPlaces from '@/components/FormPlaces.vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import RegistrationStatus from '@/components/RegistrationStatus.vue';
import successPublication from '@/components/publication/successPublication.vue';
import { getAllCategories } from '@/services/categories.service.js';
import { getAll } from '@/services/exploitationTypes.service';
import { getAvailableImages, getOnePlace, updatePlace } from '@/services/places.service.js';
import {
    arePlaceFormsEqual,
    createEmptyPlaceForm,
    isCompletePlaceForm,
    mergePlaceImages,
    normalizePlaceForm,
    placeToForm
} from '@/utilities/placeForm.js';
import errorCard from '@/views/sharedViews/errorCard.vue';
import inProgressCard from '@/views/sharedViews/inProgressCard.vue';

const route = useRoute();
const router = useRouter();

const place = ref(null);
const formData = ref(createEmptyPlaceForm());
const savedSnapshot = ref(null);
const categories = ref([]);
const types = ref([]);
const images = ref([]);
const currentStep = ref(1);
const isLoading = ref(true);
const loadError = ref('');
const requestStatus = ref(null);
const requestError = ref('');
const lastRequestedStatus = ref(null);
const publishedPlace = ref(null);

const normalizedForm = computed(() => normalizePlaceForm(formData.value));
const isDirty = computed(() => (
    savedSnapshot.value !== null
        && !arePlaceFormsEqual(formData.value, savedSnapshot.value)
));
const isNameValid = computed(() => (
    normalizedForm.value.name.length >= 1
        && normalizedForm.value.name.length <= 50
));
const isSaving = computed(() => requestStatus.value === 'inProgress');
const canSave = computed(() => (
    isDirty.value
        && isNameValid.value
        && (place.value?.status !== 'published' || isCompletePlaceForm(formData.value))
        && !isSaving.value
));
const canPublish = computed(() => (
    place.value?.status === 'draft'
        && currentStep.value === 3
        && isCompletePlaceForm(formData.value)
        && !isSaving.value
));

const createFormFromPlace = (savedPlace, preferredImageOrder = null) => {
    const nextForm = placeToForm(savedPlace);

    if (preferredImageOrder) {
        const returnedImageIds = new Set(nextForm.imageIds);
        nextForm.imageIds = preferredImageOrder.filter((imageId) => returnedImageIds.has(imageId));
    }

    return nextForm;
};

const applySavedPlace = (savedPlace, availableImages, preferredImageOrder = null) => {
    const nextForm = createFormFromPlace(savedPlace, preferredImageOrder);

    place.value = savedPlace;
    images.value = mergePlaceImages(savedPlace.images ?? [], availableImages);
    formData.value = nextForm;
    savedSnapshot.value = normalizePlaceForm(nextForm);
};

const loadEditor = async () => {
    isLoading.value = true;
    loadError.value = '';

    try {
        const loadedPlace = await getOnePlace(route.params.id);

        if (loadedPlace.status === 'archived') {
            await router.replace({
                name: 'places_single',
                params: { id: loadedPlace.placeId }
            });
            return;
        }

        const [loadedCategories, loadedTypes, availableImages] = await Promise.all([
            getAllCategories(),
            getAll(),
            getAvailableImages()
        ]);

        categories.value = loadedCategories;
        types.value = loadedTypes;
        applySavedPlace(loadedPlace, availableImages);
    } catch (error) {
        loadError.value = error.message;
    } finally {
        isLoading.value = false;
    }
};

const submitPlace = async (status) => {
    if (isSaving.value) return;

    requestStatus.value = 'inProgress';
    requestError.value = '';
    lastRequestedStatus.value = status;
    const submittedForm = normalizePlaceForm(formData.value);
    const isPublishing = place.value.status === 'draft' && status === 'published';

    try {
        const savedPlace = await updatePlace(place.value.placeId, {
            ...submittedForm,
            status
        });
        let availableImages = images.value;

        try {
            availableImages = await getAvailableImages();
        } catch {
            // The place is already saved; keep the current library until the next reload.
        }

        applySavedPlace(savedPlace, availableImages, submittedForm.imageIds);

        if (isPublishing && place.value.status === 'published') {
            publishedPlace.value = savedPlace;
            requestStatus.value = 'success';
        } else {
            requestStatus.value = null;
        }
    } catch (error) {
        requestError.value = error.message;
        requestStatus.value = 'error';
    }
};

const retrySubmit = () => submitPlace(lastRequestedStatus.value);
const cancel = () => router.push({
    name: 'places_single',
    params: { id: place.value?.placeId ?? route.params.id }
});
const nextStep = () => {
    if (currentStep.value < 3) currentStep.value += 1;
};
const previousStep = () => {
    if (currentStep.value > 1) currentStep.value -= 1;
};

onMounted(loadEditor);
</script>

<template>
    <div v-if="isLoading">Chargement en cours...</div>
    <errorCard
        v-else-if="loadError"
        title="Impossible de charger le lieu"
        :error="loadError"
        :cancel-path="null"
        @retry="loadEditor"
        @cancel="cancel"
    />
    <template v-else-if="place">
        <nav class="nav-container">
            <button type="button" class="button-light" @click="cancel">
                Retour à la fiche
            </button>
            <button
                type="button"
                class="button-secondary"
                :disabled="!canSave"
                @click="submitPlace(place.status)"
            >
                Enregistrer
            </button>
        </nav>

        <div class="editor-heading">
            <h1>Modifier {{ place.name }}</h1>
            <RegistrationStatus :is-saved="!isDirty" />
        </div>

        <ProgressBarCreatePlace
            :current-step="currentStep"
            :allow-navigation="false"
        />

        <FormPlaces
            v-model="formData"
            :current-step="currentStep"
            :categories="categories"
            :types="types"
            :images="images"
        />

        <inProgressCard
            v-if="requestStatus === 'inProgress'"
            title="Enregistrement en cours..."
        />
        <errorCard
            v-else-if="requestStatus === 'error'"
            title="Échec de l'enregistrement"
            :error="requestError"
            :cancel-path="null"
            @retry="retrySubmit"
            @cancel="cancel"
        />
        <successPublication
            v-else-if="requestStatus === 'success'"
            :slug="publishedPlace?.slug"
        />

        <div v-if="requestStatus !== 'success'" class="button-group">
            <button type="button" class="button-secondary" @click="cancel">
                Annuler
            </button>
            <button
                v-if="currentStep > 1"
                type="button"
                class="button-secondary"
                :disabled="isSaving"
                @click="previousStep"
            >
                Précédent
            </button>
            <button
                v-if="currentStep < 3"
                type="button"
                class="button-primary"
                :disabled="isSaving"
                @click="nextStep"
            >
                Suivant
            </button>
            <button
                v-else-if="place.status === 'draft'"
                type="button"
                class="button-primary"
                :disabled="!canPublish"
                @click="submitPlace('published')"
            >
                Publier
            </button>
        </div>
    </template>
</template>

<style scoped>
.nav-container {
    display: flex;
    align-items: end;
    justify-content: space-between;
}

.editor-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-large);
}
</style>
