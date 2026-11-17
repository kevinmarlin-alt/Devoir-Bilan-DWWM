<script setup>
import { ref, onMounted, watch } from 'vue';
import { getAllCategories } from '@/services/categories.service.js';
import { getAll } from '@/services/exploitationTypes.service.js';

const props = defineProps({
    place: { type: Object, default: null },
    currentStep: Number
})

const loading = ref({
    categories: false,
    types: false
});

const error = ref({
    categories: null,
    types: null
});

const categories = ref([]);
const types = ref([]);

const form = ref({
    name: '',
    description: '',
    categorySelected: '',
    typesSelected: []
});

watch(() => props.place, (place) => {
    form.value = {
        name: place?.name || '',
        description: place?.description || '',
        categorySelected: place?.category?.categoryId || place?.categoryId || '',
        typesSelected: place?.exploitationTypes?.map(type => type.exploitationTypeId) || []
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

onMounted(async () => {
    await Promise.all([
        loadCategories(),
        loadTypes()
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
