<script setup>
import TagStatus from '@/components/TagStatus.vue';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import ButtonSecondary from '@/components/buttons/ButtonSecondary.vue';
import ImagePlace from '@/components/images/ImagePlace.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getOnePlace } from '@/services/places.service.js';
import { toFormateDateTime } from '@/utilities/date.js';
import WarningCard from '../sharedViews/WarningCard.vue';
import InProgressCard from '../sharedViews/inProgressCard.vue';

const route = useRoute();

const place = ref({});
const isLoadingPlace = ref(true);
const error = ref(null);

const visibleButtonGroup = ref(true);

const archivingState = ref({
    warning: false,
    inProgress: false,
    success: false,
    error: false
});

function showWarningBox() {
    visibleButtonGroup.value = false

    archivingState.value.warning = true
}

function handleArchiving() {
    visibleButtonGroup.value = false
    
    archivingState.value.warning = false
    archivingState.value.inProgress = true
}

function handleCancelArchiving() {
    visibleButtonGroup.value = true
    archivingState.value.warning = false
}

onMounted(async () => {
    try {
        place.value = await getOnePlace(route.params?.id)
        
    } catch (err) {
        error.value = err.message
    } finally {
        isLoadingPlace.value = false
    }
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
        <div style="display: flex; gap: 1rem;">
            <MetricsCard 
                description="Consultations"
                :value="6"
            />
            <MetricsCard 
                description="Demandes d'information"
                :value="1"
            />
        </div>
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
                    <h3>Image<span v-if="place.images.length > 1">s</span> ({{ place.images.length }})</h3>
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
                <ButtonPrimary>Modifier</ButtonPrimary>

                <ButtonSecondary v-if="place.status !== 'published'" 
                    variant="error"
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
                <WarningCard v-if="archivingState.warning" 
                    title="Vous êtes sur le point d'archiver ce lieu."
                    style="width: 350px;"
                    @cancel="handleCancelArchiving"
                    @confirm="handleArchiving"
                />
                <InProgressCard v-else-if="archivingState.inProgress"
                    style="width: 350px;"
                    title="Archivage en cours..."
                />

            </template>
        </div>
    </template>
    
</template>