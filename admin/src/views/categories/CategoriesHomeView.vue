<script setup>
import { getAll, deteleCategory } from '@/services/categories.service.js';
import MetricsCard from '@/views/sharedViews/MetricsCard.vue';
import Table from '@/components/Table.vue';
import TagActive from '@/components/TagActive.vue';
import { computed, onMounted, ref } from 'vue';
import { toFormateDateTime } from '@/utilities/date.js';
import inProgressCard from '@/views/sharedViews/inProgressCard.vue'
import errorCard from '@/views/sharedViews/errorCard.vue';
import successCard from '@/views/sharedViews/successCard.vue';
import WarningCard from '@/views/sharedViews/WarningCard.vue';
import { useRouter } from 'vue-router';
import MainHeader from '@/components/MainHeader.vue'

const router = useRouter()

onMounted(() => {
    getAllCategories()
})

const categoriesListe = ref([]);
const loading = ref(true);
const error = ref(null);

const search = ref('');
const statusFilter = ref('all');

const status = ref(null);
const errorMessage = ref('');
const category = ref('');

const categoryToBeDeteled = ref(null);

const filteredCategories = computed(() => {
    return categoriesListe.value.filter(category => {
        const matchName = category.categoryName
            .toLowerCase()
            .includes(search.value.trim().toLowerCase());
        
        const matchStatus = 
            statusFilter.value === 'all'
            || statusFilter.value === 'active' && category.isActive
            || statusFilter.value === 'inactive' && !category.isActive;

        return matchName && matchStatus
    })
})

const total = computed(() => categoriesListe.value.length);
const active = computed(() => {
    return categoriesListe.value.filter(category => category.isActive).length
});
const inactive = computed(() => {
    return total.value - active.value
});

function resetFilters() {
    search.value = '';
    statusFilter.value = 'all';
}

async function getAllCategories() {
    try {
        categoriesListe.value = await getAll();
    } catch (error) {
        error.value = 'Impossible de charger les catégories'
    } finally {
        loading.value = false
    }
}

function createCategory() {
    router.push({
        name: 'categories-create'
    })
}

async function showWarningCard(entity) {
    category.value = entity
    status.value = 'warning';
}

function cancelHandler() {
    category.value = null
    status.value = null;
}

async function deleteCategory() {
    status.value = 'inProgress';
    try {
        await deteleCategory(category.value)
        status.value = 'success' 
        getAllCategories();  
        setTimeout(() => {
            status.value = null
        }, 3000)     
    } catch (error) {
        errorMessage.value = error.message
        status.value = 'error'
    }

}

function editCategory(entity) {
    router.push({ name: 'categories-update', params: { categoryId: entity.categoryId }})
}
</script>

<template>
    <MainHeader
        title="Gestion des catégories"
        :data="categoriesListe.length > 0"
        button="nouvelle catégorie"
        @add-one="createCategory"
    />
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
    <p v-if="loading">
        Chargement...
    </p>
    <p v-else-if="error">
        {{ error }}
    </p>
    <form action="#" method="GET" class="main-form-search" v-if="categoriesListe.length > 0">
        <div class="input-group form-search">
            <label for="search">Recherche</label>
            <input
                v-model="search"
                type="search"
                name="search"
                id="search"
                placeholder="Rechercher par nom..."
            >
        </div>
        <div class="input-group form-filter">
            <label for="status">Status</label>
            <select id="status" v-model="statusFilter">
                <option value="all">Tous</option>
                <option value="active">Actives</option>
                <option value="inactive">Inactives</option>
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
    <WarningCard 
        v-if="status === 'warning'" 
        title="Vous êtes sur le point de supprimer cette catégorie."
        entity=""
        flex-direction="row"
        @confirm="deleteCategory"
        @cancel="cancelHandler" 
    />
    <inProgressCard v-else-if="status === 'inProgress'"
        title="Suppression en cours..."
    />
    <errorCard v-else-if="status === 'error'"
        title="Echec de la suppression"
        :error="errorMessage"
        flex-direction="row"
        @retry="deleteCategory"
        @cancel="cancelHandler"
    />
    <successCard v-else-if="status === 'success'"
        :title="`La catégories ${category.categoryName} à bien été supprimée !`"
    />
    <Table v-if="filteredCategories.length > 0"
        :headers="[
            'Nom',
            'Nombre de lieux',
            'Status',
            'Dernière mise à jour'
        ]"
        :data="filteredCategories"
        row-key="categoryId"
    >
        <template #column0="{ entity }">
            {{ entity.categoryName }}
        </template>
        <template #column1="{ entity }">
            TBD
        </template>
        <template #column2="{ entity }">
            <TagActive
                :status="entity.isActive"
            />
        </template>
        <template #column3="{ entity }">
            {{ toFormateDateTime(new Date(entity.updatedAt  ?? entity.createdAt))  }}
        </template>
        <template #actions="{ entity }">
            <button class="button-table" @click="editCategory(entity)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line preview-icon">
                    <path d="M13 21h8"/><path d="m15 5 4 4"/>
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                </svg>
            </button>
            <button class="button-table-delete" @click="showWarningCard(entity)">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash preview-icon">
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M3 6h18"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>
        </template>
    </Table>
    <p v-if="categoriesListe.length > 0  && filteredCategories.length === 0">
        Auncune catégorie ne correspond aux filtres.
    </p>

    <div  v-if="categoriesListe.length === 0">
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