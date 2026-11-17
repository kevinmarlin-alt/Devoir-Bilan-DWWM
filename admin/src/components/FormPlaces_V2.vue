<script setup>
import { ref, onMounted, watch } from 'vue';
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
</style>
