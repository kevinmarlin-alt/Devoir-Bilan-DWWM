<script setup>
import { reactive, computed, watch } from 'vue';
import FormFilter from './FormFilter.vue';

const props = defineProps({
    fields: { type: Array, default: () => [] },
    data: { type: Array, required: true },
    idName: { type: String, default: 'name'}
})

const emit = defineEmits(['results-change'])

const filters = reactive({
    [props.idName]:''
})

const filteredDate = computed(() => {
    return props.data.filter(item => {
        // Recherche par nom
        const matchesName = String(item[props.idName] ?? '')
            .toLowerCase()
            .includes(filters[props.idName].trim().toLowerCase())

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
    filters[props.idName] = ''

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
                v-model="filters[props.idName]"
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