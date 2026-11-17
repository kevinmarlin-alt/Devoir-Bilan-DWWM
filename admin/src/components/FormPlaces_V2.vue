<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { getAllCategories } from '@/services/categories.service.js';
import { getAll } from '@/services/exploitationTypes.service.js';
import { getAvailableImages } from '@/services/places.service.js';
import PlaceImageSelectionCard from '@/components/images/PlaceImageSelectionCard.vue';

const props = defineProps({
    place: { type: Object, default: null },
    currentStep: Number
})

const emit = defineEmits(['update-form']);

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

watch(form, (value) => {
    emit('update-form', {
        name: value.name.trim(),
        description: value.description.trim(),
        categoryId: value.categorySelected || null,
        exploitationTypeIds: [...value.typesSelected],
        imageIds: [...value.imagesSelected],
        mainImageId: value.mainImageId
    });
}, { deep: true, immediate: true });

const publicationRules = computed(() => [
    { label: 'Nom renseigné', isValid: form.value.name.trim().length > 0 && form.value.name.trim().length <= 50 },
    { label: 'Description renseignée', isValid: form.value.description.trim().length > 0 },
    { label: 'Catégorie renseignée', isValid: Boolean(form.value.categorySelected) },
    { label: "Types d’exploitation renseignés", isValid: form.value.typesSelected.length > 0 },
    { label: `Au moins une photographie (${form.value.imagesSelected.length})`, isValid: form.value.imagesSelected.length > 0 },
    {
        label: 'Photo principale sélectionnée',
        isValid: form.value.mainImageId !== null && form.value.imagesSelected.includes(form.value.mainImageId)
    }
]);

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

onMounted(async () => {
    await Promise.all([
        loadCategories(),
        loadTypes(),
        loadAvailableImages()
    ]);
});
</script>

<template>
    <form @submit.prevent>
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
                        maxlength="50"
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
                    <PlaceImageSelectionCard
                        v-for="image in selectedImages"
                        :key="image.imageId"
                        :image="image"
                        selected
                        :is-main="form.mainImageId === image.imageId"
                        show-main-choice
                        @remove="removeImage"
                        @set-main="setMainImage"
                    />
                </ul>
            </section>

            <hr class="images-separator">

            <section aria-labelledby="available-images-title">
                <div class="section-heading">
                    <h2 id="available-images-title">Images disponibles</h2>
                    <p>Images non affectées à un autre lieu.</p>
                </div>

                <p v-if="loading.images">Chargement des images disponibles…</p>
                <p v-else-if="error.images">{{ error.images }}</p>
                <p v-else-if="unselectedAvailableImages.length === 0">Aucune image disponible.</p>
                <ul v-else class="images-grid" role="list">
                    <PlaceImageSelectionCard
                        v-for="image in unselectedAvailableImages"
                        :key="image.imageId"
                        :image="image"
                        @add="addImage"
                    />
                </ul>
            </section>
        </fieldset>
        <fieldset v-else-if="currentStep === 3" name="publication" class="publication-section">
            <legend>Vérification avant validation</legend>
            <div class="validation-card">
                <p>Le lieu peut être publié s’il remplit les conditions suivantes</p>
                <ul>
                    <li v-for="rule in publicationRules" :key="rule.label">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :class="rule.isValid ? 'color-success' : 'color-warning'"
                            aria-hidden="true"
                        >
                            <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                            <path d="m9 11 3 3L22 4"/>
                        </svg>
                        {{ rule.label }}
                    </li>
                </ul>
            </div>
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

.images-separator {
    width: 100%;
    height: 2px;
    margin: 0;
    border: 0;
    background-color: var(--black-500);
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

.publication-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-medium);
}

.validation-card {
    padding: var(--space-large);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-large);
    background-color: var(--card-background);
}

.validation-card > p {
    margin-top: 0;
    margin-bottom: var(--space-large);
    color: var(--champagne);
}

.validation-card ul {
    display: flex;
    flex-direction: column;
    gap: var(--space-large);
    margin: 0;
    padding: 0;
    list-style: none;
}

.validation-card li {
    display: flex;
    align-items: center;
    gap: var(--space-small);
}

.color-success {
    color: var(--green-soft);
}

.color-warning {
    color: var(--amber-warm);
}

</style>
