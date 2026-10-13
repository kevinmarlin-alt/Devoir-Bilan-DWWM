<script setup>
import { computed, ref } from 'vue';

const name = ref('');
const description = ref('');

const registrationStatus = ref('inProgress')

const  isCreateButtonDisable = computed(() => {
    return !name.value.trim() || !description.value.trim()
});

function createHandler() {
    try {
        registrationStatus.value = 'Enregistrement en cours...'
        
    } catch (error) {
        registrationStatus.value = 'Non enregistré'
    } finally {

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
        <div class="form-info" v-if="registrationStatus === 'inProgress'">
            <p>Enregistrement en cours...</p>
        </div>
    </div>
    <div class="button-group">
        <div class="registration-status">
            <spam></spam>{{ registrationStatus }}
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

.form-info {
    width: 100%;
    background-color: var(--card-background);
    border-radius: var(--radius-medium);
    border: 1px solid var(--black-500);
    font-family: "Baskervville Regular", serif;
    font-size: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.button-group {
    align-self: end;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.button-secondary {
    height: 100%;
}
</style>