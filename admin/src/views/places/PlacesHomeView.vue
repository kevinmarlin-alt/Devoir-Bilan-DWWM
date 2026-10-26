<script setup>
import MainHeader from '@/components/MainHeader.vue';
import MetricsCard from '@/views/sharedViews/MetricsCard.vue';
import SearchForm from '@/components/SearchForm.vue';
import { getAll } from '@/services/places.service.js';
import { toFormateDateTime } from '@/utilities/date.js';
import TagActive from '@/components/TagActive.vue';
import { computed, onMounted, ref } from 'vue';

const places = ref([]);

const statusFilter = ref('all');
const search = ref('');


const active = computed(() => {
    return places.value.filter(place => place.isActive).length || null
})
const inactive = computed(() => {
    return places.value.length - active.value
})

const filteredPlaces = computed(() => {
    return places.value.filter(type => {
        const matchName = type.name
            .toLowerCase()
            .includes(search.value.trim().toLowerCase())

        const matchStatus = 
            statusFilter.value === 'all'
            || statusFilter.value === 'active' && type.isActive
            || statusFilter.value === 'inactive' && !type.isActive

        return matchName && matchStatus
    })
})

onMounted(async () => {
    places.value = await getAll();
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
            description="Total"
            :value="places.length"
        />
        <MetricsCard
            description="Actifs"
            :value="active"
        />
        <MetricsCard
            description="Inactifs"
            :value="inactive"
        />
    </div>
    <div v-if="places.length === 0" class="no-data-wrapper">
        <p>Aucun lieu pour le moment</p>
        <button type="button" class="button-primary">Créer un nouveau lieu</button>
    </div>
    <SearchForm
        :options-list="[
            {value: 'active', label: 'Actif'},
            {value: 'inactive', label: 'Inactif'}
        ]"
        @status="(statusSelected) => statusFilter = statusSelected"
        @search="(searchValue) => search = searchValue"
    />
    <Table 
        v-if="filteredPlaces.length > 0"
        :headers="[
            'Nom',
            'Nombre de lieux',
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
            <!-- <button class="button-table" @click="editExploitation(entity)"> -->
            <button class="button-table" >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line preview-icon">
                    <path d="M13 21h8"/><path d="m15 5 4 4"/>
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
    <div>
        {{ filteredPlaces }}
    </div>

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