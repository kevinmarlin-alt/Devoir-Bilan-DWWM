<script setup>
import TagStatus from '@/components/TagStatus.vue';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import ButtonPrimary from '@/components/buttons/ButtonPrimary.vue';
import ButtonSecondary from '@/components/buttons/ButtonSecondary.vue';
import ImagePlace from '@/components/images/ImagePlace.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getOnePlace } from '@/services/places.service.js';

const route = useRoute();

const place = ref({});
const isLoadingPlace = ref(true);
const error = ref(null);

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
            <h1>Titre du lieu</h1>
            <TagStatus status="draft"/>
        </div>
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
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, accusantium dicta cumque nihil aliquid, laboriosam odit soluta dolor nulla ipsam optio neque ea reiciendis explicabo, aliquam sapiente voluptates repellendus animi.
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Numquam, accusantium dicta cumque nihil aliquid, laboriosam odit soluta dolor nulla ipsam optio neque ea reiciendis explicabo, aliquam sapiente voluptates repellendus animi.
                </p>
            </section>
            <div style="display: flex; gap: 5rem; flex-wrap: wrap;">
                <section>
                    <h3>Catégorie</h3>
                    <p>
                        Nom de la catégorie
                    </p>
                </section>
                <section>
                    <h3>Types d'exploitation</h3>
                    <ul>
                        <li>Type 1</li>
                        <li>Type 2</li>
                        <li>Type 3</li>
                    </ul>
                </section>
            </div>
        </section>
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end;">
            <section>
                <h2>Photographies</h2>
                <h3>Images séléctionnées (3)</h3>
                <ul style="display: flex; flex-wrap: wrap; gap: 1rem; margin: 1rem; max-width: 800px;">
                    <li>
                        <ImagePlace style="" :source="{ imageId: 1, slug: 'test-slug', filename: 'loft-industriel.png', alt: 'alt-test', isMain: false}"/>
                    </li>
                </ul>
            </section>
            <div
                role="group"
                aria-label="Actions liées au lieu"
                style="display: flex; align-items: stretch; width: 250px; flex-direction: column; gap: 0.5rem;"
            >
                <ButtonPrimary>Modifier</ButtonPrimary>
                <ButtonSecondary>Archiver</ButtonSecondary>
            </div>
        </div>
    </template>
    {{ place }}

</template>