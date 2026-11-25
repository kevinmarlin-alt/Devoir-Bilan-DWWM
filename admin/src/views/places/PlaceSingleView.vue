<script setup>
import TagStatus from '@/components/TagStatus.vue';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import ButtonSecondary from '@/components/buttons/ButtonSecondary.vue';
import ImagePlace from '@/components/images/ImagePlace.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { changeStatus, deletePlace, getOnePlace, getPlaceMetrics } from '@/services/places.service.js';
import { toFormateDateTime } from '@/utilities/date.js';
import WarningCard from '../sharedViews/WarningCard.vue';
import InProgressCard from '../sharedViews/inProgressCard.vue';
import SuccessCard from '../sharedViews/successCard.vue';
import ErrorCard from '../sharedViews/errorCard.vue';

const route = useRoute();
const router = useRouter();

const place = ref({});
const isLoadingPlace = ref(true);
const error = ref(null);
const metrics = ref(null);
const isLoadingMetrics = ref(true);
const metricsError = ref(false);
const archivingError = ref('');
const deletionError = ref('');
const visibleButtonGroup = ref(true);
let successTimer;

const archivingState = ref({
    warning: false,
    inProgress: false,
    success: false,
    error: false
});

const deletionState = ref({
    warning: false,
    inProgress: false,
    success: false,
    error: false
});

function showWarningBox() {
    visibleButtonGroup.value = false

    archivingState.value.warning = true
}

function showDeletionWarning() {
    visibleButtonGroup.value = false
    deletionState.value.warning = true
}

function handleUpdate() {
    router.push({
        name: 'places_update',
        params: { id: place.value.placeId }
    })
}

async function handleDeletion() {
    visibleButtonGroup.value = false
    deletionState.value.warning = false
    deletionState.value.inProgress = true
    deletionState.value.success = false
    deletionState.value.error = false
    deletionError.value = ''

    try {
        await deletePlace(route.params.id)

        deletionState.value.inProgress = false
        deletionState.value.success = true

        successTimer = setTimeout(() => {
            router.push({ name: 'places_home' })
        }, 3000)
    } catch (err) {
        deletionError.value = err.message
        deletionState.value.inProgress = false
        deletionState.value.error = true
    }
}

async function handleArchiving() {
    visibleButtonGroup.value = false
    archivingState.value.warning = false
    archivingState.value.inProgress = true
    archivingState.value.success = false
    archivingState.value.error = false
    archivingError.value = ''

    try {
        const archivedPlace = await changeStatus(route.params.id, 'archived')

        place.value = archivedPlace
        archivingState.value.inProgress = false
        archivingState.value.success = true

        successTimer = setTimeout(() => {
            archivingState.value.success = false
            visibleButtonGroup.value = true
        }, 3000)
    } catch (err) {
        archivingError.value = err.message
        archivingState.value.inProgress = false
        archivingState.value.error = true
    }
}

function handleCancelArchiving() {
    visibleButtonGroup.value = true
    archivingState.value.warning = false
    archivingState.value.error = false
    archivingError.value = ''
}

function handleCancelDeletion() {
    visibleButtonGroup.value = true
    deletionState.value.warning = false
    deletionState.value.error = false
    deletionError.value = ''
}

onBeforeUnmount(() => clearTimeout(successTimer))

async function loadPlace(id) {
    try {
        place.value = await getOnePlace(id)
        
    } catch (err) {
        error.value = err.message
    } finally {
        isLoadingPlace.value = false
    }
}

async function loadMetrics(id) {
    try {
        metrics.value = await getPlaceMetrics(id);
    } catch {
        metricsError.value = true;
    } finally {
        isLoadingMetrics.value = false;
    }
}

onMounted(() => {
    const id = route.params.id;
    void loadPlace(id);
    void loadMetrics(id);
});
</script>

<template>
    <nav class="nav-container">
        <RouterLink 
            to="/admin/places"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>
    </nav>
    <div v-if="isLoadingPlace">
        Chargement en cours...
    </div>
    <div v-else-if="error">
        {{ error }}
    </div>
    <template v-else>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1>{{ place.name }}</h1>
            <TagStatus :status="place.status"/>
        </div>
        <p style="font-size: 0.8rem;">Dernière mise à jour enregistré : {{ toFormateDateTime(new Date(place.updatedAt  ?? place.createdAt))  }}</p>
        <section aria-label="Métriques du lieu">
            <p>Données des 90 derniers jours</p>
            <p v-if="isLoadingMetrics" role="status">Chargement des métriques…</p>
            <p v-else-if="metricsError" role="status">Les métriques sont temporairement indisponibles.</p>
            <div v-else style="display: flex; flex-wrap: wrap; gap: 1rem;">
                <MetricsCard description="Consultations" :value="metrics.views" />
                <MetricsCard description="Demandes d’information" :value="metrics.inquiries" />
                <MetricsCard description="Taux de conversion" :value="metrics.conversionRate" suffix=" %" />
            </div>
        </section>
        <section>
            <h2>Informations générales</h2>
            <section style="margin-bottom: 1rem;">
                <h3>Description</h3>
                <p>{{ place.description || 'Aucune description pour le moment' }}</p>
            </section>
            <div style="display: flex; gap: 5rem; flex-wrap: wrap;">
                <section>
                    <h3>Catégorie</h3>
                    <p>
                        {{ place.category?.categoryName || 'Aucune catégorie séléctionnée' }}
                    </p>
                </section>
                <section>
                    <h3>Types d'exploitation</h3>
                    <p v-if="place.exploitationTypes?.length === 0">Aucun type d'exploitation séléctionné pour le moment</p>
                    <ul v-else style="list-style: initial; margin-inline-start: 1.5rem;">
                        <li v-for="type in place.exploitationTypes" :key="type.exploitationTypeId">
                            {{ type.exploitationTypeName }}
                        </li>
                    </ul>
                </section>
            </div>
        </section>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end;">
            <section>
                <h2>Photographies</h2>
                <template v-if="place.images?.length === 0">
                    <h3>Images</h3>
                    <p>Aucune image séléctionnée pour le moment</p>
                </template>
                <template v-else>
                    <h3>{{ place.images.length > 1 ? 'Images' : 'Image' }} ({{ place.images.length }})</h3>
                    <ul style="display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem; max-width: 800px;">
                        <li v-for="image in place.images" :key="image.imageId">
                            <ImagePlace style="" :source="image"/>
                        </li>
                    </ul>
                </template>
            </section>
            <div v-if="visibleButtonGroup"
                role="group"
                aria-label="Actions liées au lieu"
                style="display: flex; align-items: stretch; width: 350px; flex-direction: column; gap: 0.5rem;"
            >
                <ButtonPrimary
                    @click="handleUpdate"
                >
                    Modifier
                </ButtonPrimary>

                <ButtonSecondary v-if="place.status !== 'published'"
                    variant="error"
                    @click="showDeletionWarning"
                >
                    Supprimer
                </ButtonSecondary>
                <ButtonSecondary v-else 
                    @click="showWarningBox"
                >
                    Archiver
                </ButtonSecondary>
            </div>
            <template v-else>
                <WarningCard v-if="deletionState.warning"
                    :title="`Vous êtes sur le point de supprimer le lieu « ${place.name} ». Ses images seront conservées.`"
                    style="width: 350px;"
                    @cancel="handleCancelDeletion"
                    @confirm="handleDeletion"
                />
                <InProgressCard v-else-if="deletionState.inProgress"
                    style="width: 350px;"
                    title="Suppression en cours..."
                />
                <SuccessCard v-else-if="deletionState.success"
                    style="width: 350px;"
                    title="Le lieu a bien été supprimé."
                />
                <ErrorCard v-else-if="deletionState.error"
                    style="width: 350px;"
                    title="Échec de la suppression"
                    :error="deletionError"
                    :cancel-path="null"
                    @retry="handleDeletion"
                    @cancel="handleCancelDeletion"
                />
                <WarningCard v-else-if="archivingState.warning"
                    title="Vous êtes sur le point d'archiver ce lieu."
                    style="width: 350px;"
                    @cancel="handleCancelArchiving"
                    @confirm="handleArchiving"
                />
                <InProgressCard v-else-if="archivingState.inProgress"
                    style="width: 350px;"
                    title="Archivage en cours..."
                />
                <SuccessCard v-else-if="archivingState.success"
                    style="width: 350px;"
                    title="Le lieu a bien été archivé."
                />
                <ErrorCard v-else-if="archivingState.error"
                    style="width: 350px;"
                    title="Échec de l'archivage"
                    :error="archivingError"
                    :cancel-path="null"
                    @retry="handleArchiving"
                    @cancel="handleCancelArchiving"
                />

            </template>
        </div>
    </template>
</template>
