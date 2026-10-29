<script setup>
import MainHeader from '@/components/MainHeader.vue';
import MetricsCard from '@/views/sharedViews/MetricsCard.vue';
import SearchForm from '@/components/SearchForm.vue';
import { getAllPlaces } from '@/services/places.service.js';
import { getAll } from '@/services/categories.service.js';
import { toFormateDateTime } from '@/utilities/date.js';
import TagStatus from '@/components/TagStatus.vue';
import { computed, onMounted, ref } from 'vue';
import Table from '@/components/Table.vue';

const places = ref([]);

const categories = ref([]);

const getAllCategories = async () => {
    categories.value = await getAll();
}

const optionsCategories = computed(() => {
    const optionsList = categories.value.map(category => {
        return { value: category.categoryId, label: category.categoryName }
    })

    return [
        {value: '', label: 'Tous'},
        ...optionsList
    ]
    
})

const fields = computed(() => {
    return [
        {
            id: 'categoryId',
            label: 'Catégorie',
            options: optionsCategories.value
        },
        {
            id: 'status',
            label: 'Statut',
            options: [
                {value: '', label: 'Tous'},
                {value: 'draft', label: 'Brouillons'},
                {value: 'published', label: 'Publiés'},
                {value: 'archived', label: 'Archivés'}
            ]

        }
    ]
}) 

const draft = computed(() => {
    return places.value.filter(place => place.status === 'draft').length || null
})

const published = computed(() => {
    return places.value.filter(place => place.status === 'published').length || null
})

const archived = computed(() => {
    return places.value.filter(place => place.status === 'archived').length || null
})

const filteredPlaces = ref([]);

const handleResults = (data) => {
    filteredPlaces.value = data
}

onMounted(async () => {
    places.value = await getAllPlaces();
    getAllCategories()
})
</script>

<template>
    <MainHeader
        title="Gestion des lieux"
        :data="places.length > 0"
        button="Nouveau lieu"
    />
    <p>Description de la gestion des lieux</p>
    <div class="main-metrics">
        <MetricsCard
            description="Brouillons"
            :value="draft"
        />
        <MetricsCard
            description="Publiés"
            :value="published"
        />
        <MetricsCard
            description="Archivés"
            :value="archived"
        />
    </div>
    <div v-if="places.length == 0" class="no-data-wrapper">
        <p>Aucun lieu pour le moment</p>
        <button type="button" class="button-primary">Créer un nouveau lieu</button>
    </div>
    <SearchForm
        :fields="fields"
        :data="places"
        @results-change="handleResults"
    />
        <!-- @status="(statusSelected) => statusFilter = statusSelected" -->
        <!-- @search="(searchValue) => search = searchValue" -->
    <Table 
        v-if="filteredPlaces.length > 0"
        :headers="[
            'Nom',
            'Catégorie',
            'Status',
            'Dernière mise à jour'
        ]"
        :data="filteredPlaces"
        row-key="placeId"
    >
        <template #column0="{ entity }">
            {{ entity.name }}
        </template>
        <template #column1="{ entity }">
            {{ entity.categoryId }}
        </template>
        <template #column2="{ entity }">
            <TagStatus
                :status="entity.status"
            />
        </template>
        <template #column3="{ entity }">
            {{ toFormateDateTime(new Date(entity.updatedAt  ?? entity.createdAt))  }}
        </template>
        <template #actions="{ entity }">
            <!-- <button class="button-table" @click="editExploitation(entity)"> -->
            <button class="button-table" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line preview-icon">
                    <path d="M13 21h8"/>
                    <path d="m15 5 4 4"/>
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                </svg>
            </button>
            <!-- <button class="button-table-delete" @click="showWarningCard(entity)"> -->
            <button class="button-table-delete" >
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
</template>

<style>
.no-data-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    height: 300px;
}
</style>