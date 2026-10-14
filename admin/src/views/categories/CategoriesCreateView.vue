<script setup>
import { computed, ref } from 'vue';
import inProgressCard from '../sharedViews/inProgressCard.vue';
import errorCard from '../sharedViews/errorCard.vue';
import successCard from '../sharedViews/successCard.vue';

const name = ref('');
const description = ref('');
const registrationStatus = ref('success');

const  isCreateButtonDisable = computed(() => {
    return !name.value.trim() || !description.value.trim()
});

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
    <h1>Nom de la catégorie</h1>
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
        </form>
        <inProgressCard
            v-if="registrationStatus === 'inProgress'"
            title="Enregistrement en cours..."
        />
        <errorCard
            v-else-if="registrationStatus === 'error'"
            title="Echec de l'enregistrement"
        />
        <successCard
            v-else-if="registrationStatus === 'success'"
            title="La nouvelle catégorie à bien été enregistrée"
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
            @click="createHandler"
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