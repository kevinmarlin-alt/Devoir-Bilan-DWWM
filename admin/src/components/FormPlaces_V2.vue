<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { getAllCategories } from '@/services/categories.service.js';
import { getAll } from '@/services/exploitationTypes.service.js';
import { getAvailableImages } from '@/services/places.service.js';

const props = defineProps({
    place: { type: Object, default: null },
    currentStep: Number
})

const loading = ref({
    categories: false,
    types: false,
    images: false
});

const error = ref({
    categories: null,
    types: null,
    images: null
});

const categories = ref([]);
const types = ref([]);
const availableImages = ref([]);

const allImages = computed(() => {
    const placeImages = props.place?.images || [];
    const imageMap = new Map();

    [...placeImages, ...availableImages.value].forEach((image) => {
        imageMap.set(image.imageId, image);
    });

    return [...imageMap.values()];
});

const selectedImages = computed(() => {
    return form.value.imagesSelected
        .map((imageId) => allImages.value.find((image) => image.imageId === imageId))
        .filter(Boolean);
});

const unselectedAvailableImages = computed(() => {
    return availableImages.value.filter((image) => !form.value.imagesSelected.includes(image.imageId));
});

const form = ref({
    name: '',
    description: '',
    categorySelected: '',
    typesSelected: [],
    imagesSelected: [],
    mainImageId: null
});

watch(() => props.place, (place) => {
    const selectedImages = place?.images || [];
    const mainImage = selectedImages.find((image) => image.isMain);

    form.value = {
        name: place?.name || '',
        description: place?.description || '',
        categorySelected: place?.category?.categoryId || place?.categoryId || '',
        typesSelected: place?.exploitationTypes?.map(type => type.exploitationTypeId) || [],
        imagesSelected: selectedImages.map((image) => image.imageId),
        mainImageId: mainImage?.imageId || null
    };
}, { immediate: true });

async function loadCategories() {
    loading.value.categories = true;
    error.value.categories = null;

    try {
        categories.value = await getAllCategories();
    } catch (err) {
        error.value.categories = err.message || 'Impossible de charger les catégories.';
    } finally {
        loading.value.categories = false;
    }
}

async function loadTypes() {
    loading.value.types = true;
    error.value.types = null;

    try {
        types.value = await getAll();
    } catch (err) {
        error.value.types = err.message || 'Impossible de charger les types d’exploitation.';
    } finally {
        loading.value.types = false;
    }
}

async function loadAvailableImages() {
    loading.value.images = true;
    error.value.images = null;

    try {
        availableImages.value = await getAvailableImages();
    } catch (err) {
        error.value.images = err.message || 'Impossible de charger les images disponibles.';
    } finally {
        loading.value.images = false;
    }
}

function addImage(imageId) {
    if (form.value.imagesSelected.includes(imageId)) {
        return;
    }

    form.value.imagesSelected.push(imageId);

    if (form.value.mainImageId === null) {
        form.value.mainImageId = imageId;
    }
}

function removeImage(imageId) {
    const imageIndex = form.value.imagesSelected.indexOf(imageId);

    if (imageIndex === -1) {
        return;
    }

    form.value.imagesSelected.splice(imageIndex, 1);

    if (form.value.mainImageId === imageId) {
        form.value.mainImageId = form.value.imagesSelected[0] || null;
    }
}

function setMainImage(imageId) {
    if (!form.value.imagesSelected.includes(imageId)) {
        return;
    }

    form.value.mainImageId = imageId;
}

function thumbnailPath(filename) {
    return `/assets/images/thumbnails/${filename}`;
}

onMounted(async () => {
    await Promise.all([
        loadCategories(),
        loadTypes(),
        loadAvailableImages()
    ]);
});
</script>

<template>
    <form action="" method="POST">
        <fieldset v-if="currentStep === 1" name="informations" class="informations-grid">
            <div>
                <div class="input-group">
                    <label for="name" class="required">Nom du lieu</label>
                    <input 
                        type="text" 
                        name="name" 
                        id="name" 
                        placeholder="Nom du lieu..."
                        v-model="form.name"
                        required
                    />
                </div>
                <div class="input-group">
                    <label for="description">Description</label>
                    <textarea 
                        name="description" 
                        id="description"
                        v-model="form.description"
                        placeholder="Décriver le lieu avec précision..."
                        rows="8"
                    />
                </div>
            </div>
            <div>
                <div class="input-group">
                    <label for="category">Catégories</label>
                    <p v-if="loading.categories">Chargement des catégories…</p>
                    <p v-else-if="error.categories">{{ error.categories }}</p>
                    <select v-else name="category" id="category" v-model="form.categorySelected">
                        <option value="" disabled>Séléctionner une catégorie</option>
                        <option v-for="category in categories" 
                            :key="category.categoryId"
                            :value="category.categoryId"
                        >
                            {{ category.categoryName }}
                        </option>
                    </select>
                </div>
                <fieldset>
                    <legend>Types d'exploitation</legend>
                    <p v-if="loading.types">Chargement des types d’exploitation…</p>
                    <p v-else-if="error.types">{{ error.types }}</p>
                    <div v-else v-for="type in types" 
                        :key="type.exploitationTypeName" 
                        class="checkbox-group"
                    >
                        <input 
                            type="checkbox" 
                            name="type" 
                            :id="type.exploitationTypeId"
                            :value="type.exploitationTypeId"
                            v-model="form.typesSelected"
                        >
                        <label :for="type.exploitationTypeId">
                            {{ type.exploitationTypeName }}
                        </label>
                    </div>
                </fieldset>
            </div>
        </fieldset>        
        <fieldset v-else-if="currentStep === 2" name="photographies" class="photographs-section">
            <legend>Photographies du lieu</legend>

            <section aria-labelledby="selected-images-title">
                <div class="section-heading">
                    <h2 id="selected-images-title">Images sélectionnées</h2>
                    <p>{{ selectedImages.length }} image<span v-if="selectedImages.length !== 1">s</span> sélectionnée<span v-if="selectedImages.length !== 1">s</span></p>
                </div>

                <p v-if="selectedImages.length === 0">Aucune image n’est encore sélectionnée.</p>
                <ul v-else class="images-grid" role="list">
                    <li v-for="image in selectedImages" :key="image.imageId" class="image-card">
                        <figure>
                            <img
                                :src="thumbnailPath(image.filename)"
                                :alt="image.alt || ''"
                                width="320"
                                height="180"
                            >
                            <figcaption>
                                <label :for="`main-image-${image.imageId}`">
                                    <input
                                        :id="`main-image-${image.imageId}`"
                                        v-model="form.mainImageId"
                                        type="radio"
                                        name="main-image"
                                        :value="image.imageId"
                                        @change="setMainImage(image.imageId)"
                                    >
                                    Image principale
                                </label>
                                <span v-if="form.mainImageId === image.imageId">Image principale actuelle</span>
                            </figcaption>
                        </figure>
                        <button type="button" class="button-light" @click="removeImage(image.imageId)">
                            Retirer l’image
                        </button>
                    </li>
                </ul>
            </section>

            <section aria-labelledby="available-images-title">
                <div class="section-heading">
                    <h2 id="available-images-title">Images disponibles</h2>
                    <p>Images non affectées à un autre lieu.</p>
                </div>

                <p v-if="loading.images">Chargement des images disponibles…</p>
                <p v-else-if="error.images">{{ error.images }}</p>
                <p v-else-if="unselectedAvailableImages.length === 0">Aucune image disponible.</p>
                <ul v-else class="images-grid" role="list">
                    <li v-for="image in unselectedAvailableImages" :key="image.imageId" class="image-card">
                        <figure>
                            <img
                                :src="thumbnailPath(image.filename)"
                                :alt="image.alt || ''"
                                width="320"
                                height="180"
                            >
                        </figure>
                        <button type="button" class="button-secondary" @click="addImage(image.imageId)">
                            Ajouter l’image
                        </button>
                    </li>
                </ul>
            </section>
        </fieldset>
    </form>
</template>

<style scoped>
.required::after {
    content: " *";
    width: 10px;
    height: 10px;
    color: var(--red-soft)
}

.informations-grid {
    display: grid;
    grid-template-columns: 700px 1fr;
    gap: var(--space-large);
}

.photographs-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-large);
}

.photographs-section section {
    display: flex;
    flex-direction: column;
    gap: var(--space-medium);
}

.section-heading h2,
.section-heading p {
    margin: 0;
}

.images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-medium);
    margin: 0;
    padding: 0;
    list-style: none;
}

.image-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-small);
}

.image-card figure {
    margin: 0;
}

.image-card img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: var(--radius-large);
}

.image-card figcaption {
    display: flex;
    flex-direction: column;
    gap: var(--space-small);
    margin-top: var(--space-small);
}
</style>
