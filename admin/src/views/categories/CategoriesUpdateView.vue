<script setup>
import { computed, onMounted, ref } from 'vue';
import inProgressCard from '../sharedViews/inProgressCard.vue';
import errorCard from '../sharedViews/errorCard.vue';
import successCard from '../sharedViews/successCard.vue';
import { updateCategory, getCategoryById } from '@/services/categories.service.js';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = Number(route.params.categoryId);

onMounted(() => {
    getCategory(categoryId)
})

const category = ref('');

const name = ref('');
const description = ref('');
const isActive = ref('');

const value = ref('');

async function getCategory(categoryId) {
    category.value = await getCategoryById(categoryId);

    name.value = category.value.categoryName;
    description.value = category.value.description;
    isActive.value = category.value.isActive;
}

const registrationStatus = ref(null);

const errorMessage = ref('');

const  isCreateButtonDisable = computed(() => {
    return !name.value.trim() || !description.value.trim()
});

async function updateHandler() {
    registrationStatus.value = 'inProgress';
    try {
        await updateCategory(categoryId, {
            categoryName: name.value, 
            description: description.value,
            isActive: isActive.value
        });
        registrationStatus.value = 'success'     
    } catch (error) {
        errorMessage.value = error.message
        registrationStatus.value = 'error'
    }
}

</script>

<template>
    <nav>
        <RouterLink 
            to="/admin/categories"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>
    </nav>
    <h1>{{ category.categoryName }}</h1>
    <div class="form-container">
        <form action="#" method="POST">
            <div class="input-group">
                <label for="name">Nom <sup>*</sup></label>
                <input
                    v-model="name"
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Nom de la nouvelle catégorie"
                >
            </div>
            <div class="input-group">
                <label for="description">Description <sup>*</sup></label>
                <textarea
                    v-model="description"
                    name="description"
                    id="description"
                    rows="8"
                    placeholder="Description de la catégorie..."
                />
            </div>
            <p>Status</p>
            <div class="checkbox-group">
                <input type="checkbox" name="is-active" id="is-active" v-model="isActive" :checked="isActive">
                <label for="is-active">{{ isActive ? 'Active' : 'Inactive' }}</label>
            </div>
        </form>
        <inProgressCard
            v-if="registrationStatus === 'inProgress'"
            title="Enregistrement en cours..."
        />
        <errorCard
            v-else-if="registrationStatus === 'error'"
            title="Echec de l'enregistrement"
            :error="errorMessage"
        />
        <successCard
            v-else-if="registrationStatus === 'success'"
            :title="`La catégorie ${category.categoryName} à bien été mise à jour`"
        />
        
    </div>
    <div class="button-group">
        <div class="registration-status">
            <span></span>Non enregistrée
        </div>
        <RouterLink to="/admin/categories">
            <button class="button-secondary">
                Annuler
            </button>
        </RouterLink>
        <button 
            class="button-primary"
            :disabled="isCreateButtonDisable"
            @click.prevent="updateHandler"
        >
            Enregistrer
        </button>
    </div>

</template>

<style scoped>
.form-container {
    display: flex;
    gap: 2rem;
}
form {
    min-width: 800px;
}

.button-secondary {
    height: 100%;
}
</style>