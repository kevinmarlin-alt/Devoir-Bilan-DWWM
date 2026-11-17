<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { detelePlace, getPlaceById, updatePlaceStatus } from '@/services/places.service.js';
import TagStatus from '@/components/TagStatus.vue';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import WarningCard from '@/views/sharedViews/WarningCard.vue';
import InProgressCard from '@/views/sharedViews/inProgressCard.vue';
import ErrorCard from '@/views/sharedViews/errorCard.vue';

const route = useRoute();
const router = useRouter();

const place = ref(null);
const actionStatus = ref(null);
const pendingAction = ref(null);
const errorMessage = ref('');
const successMessage = ref('');

const metrics = ref({
    consultations: 0,
    requests: 0
});

const isBusy = computed(() => actionStatus.value === 'inProgress');

const confirmationContent = computed(() => {
    switch (pendingAction.value) {
        case 'archive':
            return {
                title: 'Vous êtes sur le point d’archiver ce lieu.',
                description: 'Le lieu ne sera plus publié.'
            };
        case 'restore':
            return {
                title: 'Vous êtes sur le point de repasser ce lieu en brouillon.',
                description: 'Le lieu pourra de nouveau être modifié avant sa publication.'
            };
        default:
            return {
                title: 'Vous êtes sur le point de supprimer ce lieu.',
                description: 'Cette action sera définitive.'
            };
    }
});

const progressTitle = computed(() => {
    if (pendingAction.value === 'load') {
        return 'Chargement du lieu...';
    }

    return pendingAction.value === 'delete'
        ? 'Suppression en cours...'
        : 'Changement de statut en cours...';
});

const errorTitle = computed(() => {
    return pendingAction.value === 'load'
        ? 'Le lieu n’a pas pu être chargé'
        : 'L’action n’a pas pu être effectuée';
});

function updateHandler() {
    router.push({
        name: 'places_update',
        params: { id: place.value.placeId }
    });
}

function requestAction(action) {
    if (isBusy.value) {
        return;
    }

    pendingAction.value = action;
    actionStatus.value = 'warning';
    errorMessage.value = '';
    successMessage.value = '';
}

function cancelAction() {
    pendingAction.value = null;
    actionStatus.value = null;
    errorMessage.value = '';
}

async function confirmAction() {
    if (!pendingAction.value || isBusy.value) {
        return;
    }

    actionStatus.value = 'inProgress';
    errorMessage.value = '';

    try {
        if (pendingAction.value === 'delete') {
            await detelePlace(place.value.placeId);
            await router.push({ name: 'places_home' });
            return;
        }

        const status = pendingAction.value === 'archive' ? 'archived' : 'draft';
        place.value = await updatePlaceStatus(place.value.placeId, status);
        successMessage.value = status === 'archived'
            ? 'Le lieu a bien été archivé.'
            : 'Le lieu est repassé en brouillon.';
        actionStatus.value = 'success';
        pendingAction.value = null;
    } catch (error) {
        errorMessage.value = error.message;
        actionStatus.value = 'error';
    }
}

async function loadPlace() {
    pendingAction.value = 'load';
    actionStatus.value = 'inProgress';
    errorMessage.value = '';

    try {
        place.value = await getPlaceById(route.params.id);
        pendingAction.value = null;
        actionStatus.value = null;
    } catch (error) {
        pendingAction.value = 'load';
        errorMessage.value = error.message;
        actionStatus.value = 'error';
    }
}

function retryAction() {
    if (pendingAction.value === 'load') {
        actionStatus.value = null;
        loadPlace();
        return;
    }

    confirmAction();
}

onMounted(loadPlace);
</script>

<template>
    <nav class="nav-container">
        <RouterLink 
            to="/admin/places"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>
        <div v-if="place?.status === 'draft'" class="button-container">
            <button type="button" class="button-secondary --delete" :disabled="isBusy" @click="requestAction('delete')">Supprimer</button>
            <button type="button" class="button-primary" :disabled="isBusy" @click="updateHandler">Modifier</button>
        </div>
        <div v-else-if="place?.status === 'published'" class="button-container">
            <button type="button" class="button-secondary" :disabled="isBusy" @click="requestAction('archive')">Archiver</button>
            <button type="button" class="button-primary" :disabled="isBusy" @click="updateHandler">Modifier</button>
        </div>
        <div v-else-if="place?.status === 'archived'" class="button-container">
            <button type="button" class="button-secondary" :disabled="isBusy" @click="requestAction('restore')">Passer en brouillon</button>
            <button type="button" class="button-secondary --delete" :disabled="isBusy" @click="requestAction('delete')">Supprimer</button>
        </div>
    </nav>

    <WarningCard
        v-if="actionStatus === 'warning'"
        :title="confirmationContent.title"
        :description="confirmationContent.description"
        flex-direction="row"
        @confirm="confirmAction"
        @cancel="cancelAction"
    />
    <InProgressCard
        v-else-if="actionStatus === 'inProgress'"
        :title="progressTitle"
    />
    <ErrorCard
        v-else-if="actionStatus === 'error'"
        :title="errorTitle"
        :error="errorMessage"
        :cancel-path="pendingAction === 'load' ? '/admin/places' : route.fullPath"
        @retry="retryAction"
        @cancel="cancelAction"
    />
    <p v-else-if="actionStatus === 'success'" class="action-success" role="status">
        {{ successMessage }}
    </p>

    <template v-if="place">
    <div class="title-container">
        <h1>{{ place.name }}</h1>
        <TagStatus :status="place.status"/>
    </div>
    <section class="main-metrics">
        <MetricsCard
            description="Consultations"
            :value="metrics.consultations"
        />
        <MetricsCard
            description="Demandes d'information"
            :value="metrics.requests"
        />
    </section>
    <section>
        <h2>Informations générales</h2>
        <div class="info-container">
            <div>
                <h3 class="baseline">Description</h3>
                <p class="description-lieu">
                    {{ place.description ?? 'Aucune description pour le moment'}}
                </p>
            </div>
            <div class="category-types-container">
                <div>
                    <h3 class="baseline">Catégorie</h3>
                    <p>
                        {{ place.category?.categoryName ?? 'Aucune catégorie sélèctionnée pour le moment' }}
                    </p>
                </div>
                <div>
                    <h3 class="baseline">Types d'exploitation</h3>
                    <p v-if="place.exploitationTypes?.length === 0">
                        Aucun type d'exploitation actuellement sélèctionné
                    </p>
                    <ul v-else>
                        <li v-for="type in place.exploitationTypes">
                            {{ type.exploitationTypeName }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

    </section>
    <section>
        <h2>Photographies</h2>
        <h3 class="baseline">Images ({{ place.images?.length ?? 0  }})</h3>
        <div class="container-images">
            <p v-if="place.images?.length === 0">Aucune image séléctionnée.</p>
            <template v-else>
                <div 
                    v-for="image in place.images" :key="image.imageId"
                    class="place-image-container"
                >
                    <img
                        :src="`/assets/images/thumbnails/${image.filename}`"
                        :alt="image.alt"
                        width="320"
                        height="180"
                        loading="lazy"
                        decoding="async"
                        class="place_image"
                    >
                    <div
                        v-if="image.isMain"
                        class="main-image-button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                </div>
            </template>
        </div>
    </section>
    </template>
</template>

<style>
ul {
    list-style: initial;
    padding-left: 20px;
}

li {
    margin-bottom: 0.5rem;
}

h2 {
    margin-bottom: var(--space-large);
}

.title-container,
.button-container {
    display: flex;
    align-items: center;
    gap: var(--space-large);
}

.info-container {
    display: grid;
    grid-template-columns: minmax(400px, 800px) 1fr;
    gap: var(--space-large);
}

.category-types-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-large);
}

.container-images {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-medium);
}

.place-image-container {
    position: relative;
}

.place_image {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    border-radius: var(--radius-large);
}

.main-image-button {
    position: absolute;
    top: var(--space-small);
    right: var(--space-small);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--champagne);
    background-color: var(--champagne);
    color: var(--black-900);
}

.description-lieu {
    white-space: pre-line;
}

.action-success {
    color: var(--green-soft);
}
</style>
