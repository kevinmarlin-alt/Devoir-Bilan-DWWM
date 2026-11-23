<script setup>
import { computed } from 'vue';
import ImagePlace from './ImagePlace.vue';

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    categories: { type: Array, default: () => [] },
    types: { type: Array, default: () => [] },
    images: { type: Array, default: () => [] },
    currentStep: {
        type: Number,
        required: true
    }
});

const emit = defineEmits(['update:modelValue']);

const updateForm = (changes) => {
    emit('update:modelValue', {
        ...props.modelValue,
        ...changes
    });
};

const name = computed({
    get: () => props.modelValue.name,
    set: (value) => updateForm({ name: value })
});

const description = computed({
    get: () => props.modelValue.description,
    set: (value) => updateForm({ description: value })
});

const categoryId = computed({
    get: () => props.modelValue.categoryId,
    set: (value) => updateForm({ categoryId: value })
});

const selectedImages = computed(() => (
    props.modelValue.imageIds
        .map((imageId) => props.images.find((image) => image.imageId === imageId))
        .filter(Boolean)
));

const availableImages = computed(() => (
    props.images.filter((image) => !props.modelValue.imageIds.includes(image.imageId))
));

const toggleType = (typeId) => {
    const selectedTypeIds = [...props.modelValue.exploitationTypeIds];
    const typeIndex = selectedTypeIds.indexOf(typeId);

    if (typeIndex === -1) {
        selectedTypeIds.push(typeId);
    } else {
        selectedTypeIds.splice(typeIndex, 1);
    }

    updateForm({ exploitationTypeIds: selectedTypeIds });
};

const toggleImage = (imageId) => {
    const selectedImageIds = [...props.modelValue.imageIds];
    const imageIndex = selectedImageIds.indexOf(imageId);

    if (imageIndex === -1) {
        selectedImageIds.push(imageId);
        updateForm({
            imageIds: selectedImageIds,
            mainImageId: props.modelValue.mainImageId ?? imageId
        });
        return;
    }

    selectedImageIds.splice(imageIndex, 1);

    updateForm({
        imageIds: selectedImageIds,
        mainImageId: props.modelValue.mainImageId === imageId
            ? (selectedImageIds[0] ?? null)
            : props.modelValue.mainImageId
    });
};

const setMainImage = (imageId) => {
    if (props.modelValue.imageIds.includes(imageId)) {
        updateForm({ mainImageId: imageId });
    }
};
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
                    <select name="category" id="category" v-model="categoryId">
                        <option :value="null" disabled>
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
                        <div v-for="type in types" :key="type.exploitationTypeId" class="checkbox-group">
                            <label :for="type.exploitationTypeId">
                                <input
                                    type="checkbox"
                                    :name="type.exploitationTypeId"
                                    :id="type.exploitationTypeId"
                                    :value="type.exploitationTypeId"
                                    :checked="modelValue.exploitationTypeIds.includes(type.exploitationTypeId)"
                                    @change="toggleType(type.exploitationTypeId)"
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
            <h3>Images sélectionnées ({{ modelValue.imageIds.length }})</h3>
            <div class="container-images">
                <p v-if="selectedImages.length === 0">Aucune image sélectionnée.</p>
                <ImagePlace
                    v-for="image in selectedImages"
                    :key="image.imageId"
                    :source="image"
                    selected
                    :is-main="modelValue.mainImageId === image.imageId"
                    @image="toggleImage"
                    @main-image="setMainImage"
                />
            </div>
            <h3 class="available-images-title">Images disponibles ({{ availableImages.length }})</h3>
            <div class="container-images">
                <p v-if="availableImages.length === 0">Aucune image disponible.</p>
                <ImagePlace
                    v-for="image in availableImages"
                    :key="image.imageId"
                    :source="image"
                    :selected="false"
                    :is-main="false"
                    @image="toggleImage"
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
                            :class="!name.trim() ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Nom renseigné
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="!description.trim() ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Description renseignée
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="!modelValue.categoryId ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Catégorie renseignée
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="modelValue.exploitationTypeIds.length === 0 ? 'color-warning' : 'color-success'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Types d'exploitation renseignés
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="modelValue.imageIds.length >= 1 ? 'color-success' : 'color-warning'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Au moins une photographie ({{ modelValue.imageIds.length }})
                        </li>
                        <li>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            :class="modelValue.mainImageId ? 'color-success' : 'color-warning'">
                                <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                                <path d="m9 11 3 3L22 4"/>
                            </svg>
                            Photo principale sélectionnée
                        </li>
                    </ul>
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

.available-images-title {
    margin-top: var(--space-large);
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
