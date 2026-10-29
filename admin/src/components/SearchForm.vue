<script setup>
import { reactive, computed, watch } from 'vue';
import FormFilter from './FormFilter.vue';

const props = defineProps({
    fields: { type: Array, default: () => [] },
    data: { type: Array, required: true }
})

const emit = defineEmits(['results-change'])

const filters = reactive({
    name:''
})

const filteredDate = computed(() => {
    return props.data.filter(item => {
        // Recherche par nom
        const matchesName = String(item.name ?? '')
            .toLowerCase()
            .includes(filters.name.trim().toLowerCase())

        // Recherche sur tous les FormFilter
        const matchesFormFilter = props.fields.every(field => {
            const value = filters[field.id]
            return !value || String(item[field.id]) === value
        })

        return matchesName && matchesFormFilter
    })
})

watch(
    filteredDate,
    results => emit('results-change', results),
    { immediate: true }
)

const resetFilters = () => {
    filters.name = ''

    props.fields.forEach(field => {
        filters[field.id] = ''
    })
}

</script>

<template>
    <form action="" class="main-form-search" @submit.prevent>
        <div class="input-group form-search">
            <label for="search">Recherche</label>
            <input
                type="text"
                name="search"
                id="search"
                placeholder="Rechercher par nom..."
                v-model="filters.name"
            >
        </div>
        <div 
            v-for="field in fields"
            :key="field.id"
            class="input-group form-filter"
        >
            <label :for="field.id">{{ field.label }}</label>
            <FormFilter
                :id="field.id"
                :options="field.options"
                :model-value="filters[field.id] ?? ''"
                @selection-change="value => filters[field.id] = value"
            />

        </div>
        <button 
            type="button" 
            class="button-light"
            @click="resetFilters()"
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