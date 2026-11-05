<script setup>
import { ref, watch } from 'vue';
import ImagePlace from './ImagePlace.vue';
import inProgressCard from '@/views/sharedViews/inProgressCard.vue'
import successPublication from '@/components/publication/successPublication.vue'
import errorCard from '@/views/sharedViews/errorCard.vue'

defineProps({
    categories: { type: Array, default: [] },
    types: { type: Array, default: [] },
    images: { type: Array, default: [] },
    currentStep: Number,
    status: String,
    place: Object
})

const emits = defineEmits(['data-form', 'is-publishable'])

const name = ref('');
const description = ref('');
const category = ref('');
const selectedTypes = ref([]);
const selectedImages = ref([]);
const mainImageId = ref(null);

const toggleImage = (imageId) => {
    const imageIndex = selectedImages.value.indexOf(imageId);

    if (imageIndex === -1) {
        selectedImages.value.push(imageId);
        return;
    }

    selectedImages.value.splice(imageIndex, 1);

    if (mainImageId.value === imageId) {
        mainImageId.value = null;
    }
};

const setMainImage = (imageId) => {
    mainImageId.value = imageId;
};

watch([name, description, category, selectedTypes, selectedImages, mainImageId], () => {
    emits('data-form', {
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value,
        types: [...selectedTypes.value],
        images: [...selectedImages.value],
        mainImageId: mainImageId.value
    });
}, { deep: true });
</script>

<template>
    <form action="#" method="" class="form-container">
        <template v-if="currentStep === 1">
            <h2>Informations générales</h2>
            <div class="input-group">
                <label for="name">Nom du lieu <sup>*</sup></label>
                <input
                    v-model="name"
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Nom du lieu"
                >
            </div>
            <div class="input-group">
                <label for="description">Description</label>
                <textarea 
                    v-model="description"
                    name="description" 
                    id="description"
                    placeholder="Description du lieu ..."
                    rows="10"
                />
            </div>
            <div class="flex-container-row">
                <div class="input-group">
                    <label for="category">Catégories</label>
                    <select name="category" id="category" v-model="category">
                        <option value="" disabled>
                            {{ categories.length > 0  ? 'Sélectionner une catégorie' : 'Aucune catégorie' }}
                        </option>
                        <option
                            v-for="category in categories"
                            :key="category.categoryId"
                            :value="category.categoryId"
                        >
                            {{ category.categoryName }}
                        </option>
                    </select>
                </div>
                <fieldset>
                    <legend>Types d'exploitation</legend>
                    <div v-if="types.length === 0">
                        Aucun type d'exploitation
                    </div>
                    <template v-else>
                        <div v-for="type in types" :key="type.id" class="checkbox-group">
                            <label :for="type.exploitationTypeId">
                                <input
                                    v-model="selectedTypes"
                                    type="checkbox"
                                    :name="type.exploitationTypeId"
                                    :id="type.exploitationTypeId"
                                    :value="type.exploitationTypeId"
                                >
                                {{ type.exploitationTypeName }}
                            </label>
                        </div>
                    </template>
                </fieldset>
            </div>
        </template>
        <template v-else-if="currentStep === 2">
            <h2>Photographies</h2>
            <p>Images ajoutées ({{ selectedImages.length }})</p>
            <div class="container-images">
                <p v-if="images.length === 0">Aucune image disponible.</p>
                <ImagePlace
                    v-for="image in images"
                    :key="image.imageId"
                    :source="image"
                    :selected="selectedImages.includes(image.imageId)"
                    :is-main="mainImageId === image.imageId"
                    @image="toggleImage"
                    @main-image="setMainImage"
                />
            </div>
        </template>
        <template v-else-if="currentStep === 3">
            <h2>Vérification avant validation</h2>
            <div class="validation-card">
                <p>Le lieu peut être publié s’il rempli les conditions suivantes</p>
                <div>
                    <ul>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="!name ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Nom renseigné
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="!description ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Description renseignée
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="!category ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Catégorie renseignée
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="selectedTypes.length === 0 ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Types d'exploitation renseignés
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="selectedImages.length >= 1 ? 'color-success' : 'color-warning'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Au moins une photographie ({{ selectedImages.length }})
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="mainImageId ? 'color-success' : 'color-warning'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Photo principale sélectionnée
                        </li>
                    </ul>
                    <inProgressCard v-if="status === 'inProgress'"
                        title="Publication en cours..."
                    />
                    <errorCard v-else-if="status === 'error'"
                        title="Echec de la bublication"
                        :error="errorMessage"
                        @retry="deleteExploitation"
                        @cancel="cancelHandler"
                    />
                    <successPublication v-else-if="status === 'success'"
                    :slug="place?.slug"
                    />
                </div>
            </div>
        </template>
    </form>
</template>

<style>
.form-container {
    min-height: 400px;
}

.flex-container-row {
    display: flex;
    width: 100%;
    gap: var(--space-large);
}

.flex-container-row .input-group {
    width: 500px;
}

.container-images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-medium);
    width: 100%;
}

.validation-card {
    gap: var(--space-medium);
    background-color: var(--card-background);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-large);
    padding: var(--space-large);
}

.validation-card > p {
    color: var(--champagne);
    margin-bottom: var(--space-large);
}

.validation-card > div {
    display: flex;
}

.validation-card ul {
    display: flex;
    flex-direction: column;
    gap: var(--space-large);
    min-width: 600px;
}

.validation-card li {
    display: flex;
    align-items: center;
}

.validation-card li svg {
    margin-right: var(--space-small);
}

.color-success {
    color: var(--green-soft);
}

.color-warning {
    color: var(--amber-warm);
}
</style>
