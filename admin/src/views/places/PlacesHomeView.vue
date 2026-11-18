<script setup>
import MainHeader from '@/components/MainHeader.vue';
import MetricsCard from '@/views/sharedViews/MetricsCard.vue';
import SearchForm from '@/components/SearchForm.vue';
import { getAllPlaces, detelePlace } from '@/services/places.service.js';
import { getAllCategories } from '@/services/categories.service.js';
import { toFormateDateTime } from '@/utilities/date.js';
import TagStatus from '@/components/TagStatus.vue';
import { computed, onMounted, ref } from 'vue';
import Table from '@/components/Table.vue';
import router from '@/router';


const places = ref([]);
const filteredPlaces = ref([]);
const error = ref(null);
const loading = ref(true);
const categories = ref([]);

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

const handleResults = (data) => {
    filteredPlaces.value = data
}

const getCategories = async () => {
    try {
        categories.value = await getAllCategories();
    } catch (err) {
        error.value = 'Impossible de charger les catégories'
    } finally {
        loading.value = false
    }  
}

const getPlaces = async () => {
    try {
        places.value = await getAllPlaces();
    } catch (err) {
        error.value = 'Impossible de charger les types d\'éxploitation'
    } finally {
        loading.value = false
    }
}

const createPlace = () => {
    router.push({
        name: 'places_create'
    })
}

onMounted(async () => {
    await getPlaces();
    await getCategories()
})
</script>

<template>
    <MainHeader
        title="Gestion des lieux"
        :data="places.length > 0"
        button="Nouveau lieu"
        @add-one="createPlace"
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
    <p v-if="loading">
        Chargement en cours...
    </p>
    <p v-else-if="error">
        {{ error }}
    </p>
    <div v-if="places.length == 0" class="no-data-wrapper">
        <p>Aucun lieu pour le moment</p>
        <button type="button" class="button-primary" @click="createPlace">
            Créer un nouveau lieu
        </button>
    </div>
    <template v-else>
        <SearchForm
            :fields="fields"
            :data="places"
            @results-change="handleResults"
        />
        <Table 
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
                {{ entity.category?.categoryName ?? 'Aucune catégorie' }}
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
                <button class="button-table" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye preview-icon">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                </button>
            </template>
        </Table>
    </template>
</template>