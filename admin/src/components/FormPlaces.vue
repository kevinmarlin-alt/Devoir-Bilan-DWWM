<script setup>
import { ref, watch } from 'vue';
import ImagePlace from './ImagePlace.vue';

defineProps({
    categories: { type: Array, default: [] },
    types: { type: Array, default: [] },
    currentStep: Number
})

const emits = defineEmits(['data-form'])

const name = ref('');
const description = ref('');
const category = ref('');
const selectedTypes = ref([]);
const selectedImages = ref([]);

const toggleImage = (imageId) => {
    const imageIndex = selectedImages.value.indexOf(imageId);

    if (imageIndex === -1) {
        selectedImages.value.push(imageId);
        return;
    }

    selectedImages.value.splice(imageIndex, 1);
};

watch([name, description, category, selectedTypes, selectedImages], () => {
    emits('data-form', {
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value,
        types: [...selectedTypes.value],
        images: [...selectedImages.value]
    });
}, { deep: true });
const imagesTest = [
    {id: 1, src: 'hgsqdvckjhd.jpg', alt: 'jhsqdfgkhdhglqf'},
    {id: 2, src: 'hgsqdvckjhd.jpg', alt: 'jhsqdfgkhdhglqf'},
    {id: 3, src: 'hgsqdvckjhd.jpg', alt: 'jhsqdfgkhdhglqf'},
    {id: 4, src: 'hgsqdvckjhd.jpg', alt: 'jhsqdfgkhdhglqf'}
]
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
                <ImagePlace 
                    v-for="image in imagesTest"
                    :key="image.id"
                    :source="image"
                    :selected="selectedImages.includes(image.id)"
                    @image="toggleImage"
                />
            </div>
        </template>
        <template v-else-if="currentStep === 3">
            <h2>Vérification avant validation</h2>
        </template>
        
    </form>
</template>

<style>
.flex-container-row {
    display: flex;
    width: 100%;
    gap: var(--space-large);
}

.flex-container-row .input-group {
    width: 500px;
}

.container-images {
    display: flex;
    gap: 1rem;
}
</style>
