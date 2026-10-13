<script setup>
import { getAll } from '@/services/categories.service.js';
import MetricsCard from '../sharedViews/MetricsCard.vue';
import Table from '../sharedViews/Table.vue';
import { computed, ref } from 'vue';

const data = ref([]);

const total = computed(() => data.value.length);
const active = computed(() => {
    return data.value.filter(category => category.isActive).length
});
const inactive = computed(() => {
    return total.value - active.value
});

async function getAllCategories() {
    const categories = await getAll();
}

getAllCategories();

const headers = [
    'Nom',
    'Nombre de lieux',
    'Dernière mise à jour'
]



</script>

<template>
    
    <div class="main-header">
        <h1>Gestion des catégories</h1>
        <button v-if="data.length > 0" class="button-primary">+ nouvelle catégorie</button>
    </div>
    <p>Les catégories permettent d’organiser le catalogue de lieux et facilitent leur classification.</p>
    <div class="main-metrics" >
        <MetricsCard
            description="Total"
            :value="total"
        />
        <MetricsCard
            description="Actives"
            :value="active"
        />
        <MetricsCard
            description="Inactives"
            :value="inactive"
        />
    </div>
    <form action="#" method="GET" class="main-form-search" v-if="data.length > 0">
        <div class="input-group form-search">
            <label for="category_id">Recherche</label>
            <input
                type="search"
                name="category_id"
                id="category_id"
                placeholder="Rechercher par nom..."
            >
        </div>
        <div class="input-group form-filter">
            <label for="is_active">Status</label>
            <select name="is_active" id="is_active">
                <option value="">Active</option>
                <option value="">Inactive</option>
            </select>
        </div>
        <button type="reset" class="button-light">Réinitialiser les filtres</button>
    </form>
    <Table v-if="data.length > 0"
        :headers="headers"
        :data="data"
    >
        <template #column0="{ entity }">
            {{ entity.categoryName }}
        </template>
        <template #column1="{ entity }">
            {{ entity.description }}
        </template>
        <template #column2="{ entity }">
            {{ entity.updatedAt  ?? entity.createdAt }}
        </template>
    </Table>

    <div  v-if="data.length === 0">
        <p>Aucune catégorie actuellement</p>
        <button class="button-primary">créer une nouvelle catégorie</button>
    </div>
</template>

<style>

.form-search {
    width: 100%;
}

.form-filter {
    min-width: 150px;
    height: 100%;
}

.no-data-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
    height: 100%;
    
}

</style>