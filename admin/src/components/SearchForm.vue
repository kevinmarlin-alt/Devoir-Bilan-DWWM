<script setup>
import { ref } from 'vue';

defineProps({
    optionsList: Array
})

const search = ref('');
const statusFilter = ref('all');

const emit = defineEmits(['search', 'status'])

const resetFilters = () => {
    search.value = ''
    statusFilter.value = 'all'
    emit('search', search.value)
    emit('status', statusFilter.value)
}

</script>

<template>
    <form action="" class="main-form-search">
        <div class="input-group form-search">
            <label for="search">Recherche</label>
            <input
                v-model="search"
                type="search"
                name="search"
                id="search"
                placeholder="Rechercher par nom..."
                @input="emit('search', search)"
            >
        </div>
        <div class="input-group form-filter">
            <label for="status">Status</label>
            <select id="status" v-model="statusFilter" @change="emit('status', statusFilter)" >
                <option key="all" value="all" :selected="statusFilter === 'all'">
                    Tous
                </option>
                <option 
                    v-for="option in optionsList" 
                    :key="option.value" 
                    :value="option.value" 
                    :selected="option.value === statusFilter"
                >
                    {{ option.label }}
                </option>
            </select>
        </div>
        <button 
            type="button" 
            class="button-light"
            @click="resetFilters"
        >
            Réinitialiser les filtres
        </button>
    </form>
</template>

<style>
.form-search {
    width: 100%;
}

.form-filter {
    min-width: 150px;
}
</style>