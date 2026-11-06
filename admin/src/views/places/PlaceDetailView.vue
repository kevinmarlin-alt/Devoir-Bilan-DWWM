<script setup>
import { getPlaceById } from '@/services/places.service.js';
import TagStatus from '@/components/TagStatus.vue';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const place = ref({

});

const metrics = ref({
    consultations: 0,
    requests: 0
});


onMounted(async () => {
    place.value = await getPlaceById(route.params.id);
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
        <TagStatus :status="place.status"/>
    </nav>
    <h1>{{ place.name }}</h1>
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
</style>