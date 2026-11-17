<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import FormPlacesV2 from '@/components/FormPlaces_V2.vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';
import InProgressCard from '@/views/sharedViews/inProgressCard.vue';
import ErrorCard from '@/views/sharedViews/errorCard.vue';
import { getPlaceById, updatePlace } from '@/services/places.service.js';

const route = useRoute();
const currentStep = ref(1);
const place = ref(null);
const formData = ref(null);
const savedData = ref(null);
const requestStatus = ref(null);
const errorMessage = ref('');
const lastSubmittedStatus = ref(null);

function normalizeData(data) {
    const exploitationTypeIds = data?.exploitationTypeIds
        ?? data?.exploitationTypes?.map((type) => type.exploitationTypeId)
        ?? [];
    const imageIds = data?.imageIds
        ?? data?.images?.map((image) => image.imageId)
        ?? [];
    const mainImageId = data?.mainImageId
        ?? data?.images?.find((image) => image.isMain)?.imageId
        ?? null;

    return {
        name: (data?.name || '').trim(),
        description: (data?.description || '').trim(),
        categoryId: data?.categoryId ?? data?.category?.categoryId ?? null,
        exploitationTypeIds: [...exploitationTypeIds].sort((a, b) => a - b),
        imageIds: [...imageIds].sort((a, b) => a - b),
        mainImageId
    };
}

const hasChanges = computed(() => {
    if (!formData.value || !savedData.value) {
        return false;
    }

    return JSON.stringify(normalizeData(formData.value)) !== JSON.stringify(savedData.value);
});

const hasValidName = computed(() => {
    const name = formData.value?.name?.trim() || '';
    return name.length > 0 && name.length <= 50;
});

const isPublishable = computed(() => {
    const data = normalizeData(formData.value);

    return hasValidName.value
        && data.description.length > 0
        && Boolean(data.categoryId)
        && data.exploitationTypeIds.length > 0
        && data.imageIds.length > 0
        && data.mainImageId !== null
        && data.imageIds.includes(data.mainImageId);
});

const isSaving = computed(() => requestStatus.value === 'inProgress');
const canSave = computed(() => hasChanges.value && hasValidName.value && !isSaving.value);
const canPublish = computed(() => isPublishable.value && place.value?.status === 'draft' && !isSaving.value);

function updateForm(value) {
    formData.value = value;

    const differsFromSavedData = savedData.value
        && JSON.stringify(normalizeData(value)) !== JSON.stringify(savedData.value);

    if (differsFromSavedData && ['success', 'error'].includes(requestStatus.value)) {
        requestStatus.value = null;
    }
}

function previousStep() {
    if (currentStep.value > 1) {
        currentStep.value -= 1;
    }
}

function nextStep() {
    if (currentStep.value < 3) {
        currentStep.value += 1;
    }
}

async function submitPlace(status = place.value.status) {
    requestStatus.value = 'inProgress';
    errorMessage.value = '';
    lastSubmittedStatus.value = status;

    try {
        const data = normalizeData(formData.value);
        const updatedPlace = await updatePlace(route.params.id, { ...data, status });

        place.value = updatedPlace;
        savedData.value = normalizeData(updatedPlace);
        formData.value = normalizeData(updatedPlace);
        requestStatus.value = 'success';
    } catch (error) {
        errorMessage.value = error.message;
        requestStatus.value = 'error';
    }
}

function retrySubmission() {
    submitPlace(lastSubmittedStatus.value || place.value.status);
}

onMounted(async () => {
    try {
        place.value = await getPlaceById(route.params.id);
        savedData.value = normalizeData(place.value);
    } catch (error) {
        errorMessage.value = error.message;
        requestStatus.value = 'error';
    }
});
</script>

<template>
    <nav class="nav-container">
        <RouterLink
            :to="{ name: 'places_detail', params: { id: route.params.id }}"
            class="button-light"
        >
            Retour au lieu
        </RouterLink>
        <button
            type="button"
            class="button-secondary"
            :disabled="!canSave"
            @click="submitPlace()"
        >
            Enregistrer
        </button>
    </nav>

    <h1>{{ place?.name || 'Modifier un lieu' }}</h1>

    <ProgressBarCreatePlace :current-step="currentStep" :allow-navigation="false" />

    <FormPlacesV2
        v-if="place"
        :place="place"
        :current-step="currentStep"
        @update-form="updateForm"
    />

    <InProgressCard
        v-if="requestStatus === 'inProgress'"
        title="Enregistrement en cours..."
    />
    <ErrorCard
        v-else-if="requestStatus === 'error'"
        title="Échec de l’enregistrement"
        :error="errorMessage"
        :cancel-path="`/admin/places/${route.params.id}`"
        @retry="retrySubmission"
    />
    <p v-else-if="requestStatus === 'success'" class="save-message" role="status">
        Les modifications ont bien été enregistrées.
    </p>

    <div v-if="place" class="button-group">
        <p :class="hasChanges ? 'status-warning' : 'status-success'">
            {{ hasChanges ? 'Modifications non enregistrées' : 'Modifications enregistrées' }}
        </p>

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

<style scoped>
.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.button-group {
    margin-top: var(--space-large);
}

.button-group > p {
    flex: 1;
    margin: 0;
}

.status-warning {
    color: var(--amber-warm);
}

.status-success,
.save-message {
    color: var(--green-soft);
}

.save-message {
    margin-top: var(--space-medium);
}
</style>
