<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getPlaceById } from '@/services/places.service.js'
import { getAllCategories } from '@/services/categories.service.js'
import { getAllExploitationTypes } from '@/services/exploitationTypes.service.js'
import { toFormateDateTime } from '@/utilities/date.js'
import RegistrationStatus from '@/components/RegistrationStatus.vue';
import TagStatus from '@/components/TagStatus.vue';

const route = useRoute()
const place = ref({})
const categories = ref([])
const types = ref([])
const activeTab = ref('informations')
const isLoading = ref(true)
const isSubmitted = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const form = ref({
  name: '',
  description: '',
  status: 'draft',
  categoryId: '',
  exploitationTypeIds: [],
})

const isFormModified = computed(() => {
    const placeExploitationTypeIds = place.value.exploitationTypes
      ?.map((type) => type.exploitationTypeId)
      .sort() ?? []
    const formExploitationTypeIds = form.value.exploitationTypeIds.sort()
  
    return (
      form.value.name.trim() !== (place.value.name ?? '') ||
      form.value.description.trim() !== (place.value.description ?? '') ||
      form.value.categoryId !== (place.value.categoryId ?? '') ||
      JSON.stringify(formExploitationTypeIds) !== JSON.stringify(placeExploitationTypeIds)
    )
})

const errors = computed(() => ({
  name: !form.value.name.trim()
    ? 'Le nom du lieu est obligatoire.'
    : form.value.name.trim().length > 50
      ? 'Le nom ne peut pas dépasser 50 caractères.'
      : '',
  description:
    form.value.status === 'published' && !form.value.description.trim()
      ? 'La description est obligatoire pour publier le lieu.'
      : '',
  categoryId:
    form.value.status === 'published' && !form.value.categoryId
      ? 'La catégorie est obligatoire pour publier le lieu.'
      : '',
  exploitationTypeIds:
    form.value.status === 'published' && form.value.exploitationTypeIds.length === 0
      ? 'Sélectionnez au moins un type d’exploitation pour publier le lieu.'
      : '',
}))
const isFormValid = computed(() => Object.values(errors.value).every((error) => !error))
const toggleTab = (tabName) => {
  activeTab.value = tabName
}

const loadPlace = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const [placeData, categoriesData, typesData] = await Promise.all([
      getPlaceById(route.params.id),
      getAllCategories(),
      getAllExploitationTypes(),
    ])
    place.value = placeData
    categories.value = categoriesData
    types.value = typesData
    form.value = {
      name: placeData.name ?? '',
      description: placeData.description ?? '',
      status: placeData.status ?? 'draft',
      categoryId: placeData.categoryId ?? '',
      exploitationTypeIds:
        placeData.exploitationTypes?.map((type) => type.exploitationTypeId) ?? [],
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const validateForm = () => {
  isSubmitted.value = true
  successMessage.value = ''
  if (!isFormValid.value) return
  successMessage.value =
    'Les informations modifiées sont conservées dans le formulaire. L’enregistrement en base de données sera ajouté ultérieurement.'
}

onMounted(loadPlace)
</script>

<template>
  <nav class="nav-container">
    <RouterLink
      :to="{ name: 'places_detail', params: { id: route.params.id } }"
      class="button-light"
      >Retour au lieu</RouterLink
    >
  </nav>
    <div class="title-container">
        <h1>{{ place.name || 'Modifier un lieu' }}</h1>
        <TagStatus :status="place.status"/>
    </div>
  <p v-if="place.createdAt">
    Dernière mise à jour enregistrée :
    {{ toFormateDateTime(new Date(place.updatedAt ?? place.createdAt)) }}
  </p>
    <div class="tab-container">
        <button
            type="button"
            class="tab-title"
            :class="{ 'tab-active': activeTab === 'informations' }"
            @click="toggleTab('informations')"
        >
        Informations générales
        </button>
        <button
            type="button"
            class="tab-title"
            :class="{ 'tab-active': activeTab === 'photographies' }"
            @click="toggleTab('photographies')"
        >
        Photographies
        </button>
    </div>
    <p v-if="isLoading">Chargement du lieu...</p>
    <p v-else-if="errorMessage" class="message-error" role="alert">{{ errorMessage }}</p>
    <form
        v-else-if="activeTab === 'informations'"
        class="form-container"
        novalidate
        @submit.prevent="validateForm"
    >
    
    <div>
        <div class="input-group">
            <label for="name">Nom du lieu <sup>*</sup></label>
            <input
            id="name"
            v-model="form.name"
            type="text"
            maxlength="50"
            :aria-invalid="Boolean(isSubmitted && errors.name)"
            />
            <p v-if="isSubmitted && errors.name" class="field-error">{{ errors.name }}</p>
        </div>
        <div class="input-group">
            <label for="description">Description</label>
            <textarea
                id="description"
                v-model="form.description"
                rows="8"
                placeholder="Décrivez le lieu..."
                :aria-invalid="Boolean(isSubmitted && errors.description)"
            />
            <p v-if="isSubmitted && errors.description" class="field-error">{{ errors.description }}</p>
        </div>
    </div>
    <div>
        <div class="input-group">
            <label for="category">Catégorie</label>
            <select
            id="category"
            v-model="form.categoryId"
            :aria-invalid="Boolean(isSubmitted && errors.categoryId)"
            >
            <option value="">Aucune catégorie</option>
            <option
                v-for="category in categories"
                :key="category.categoryId"
                :value="category.categoryId"
            >
                {{ category.categoryName }}
            </option>
            </select>
            <p v-if="isSubmitted && errors.categoryId" class="field-error">{{ errors.categoryId }}</p>
        </div>
        <fieldset :aria-invalid="Boolean(isSubmitted && errors.exploitationTypeIds)">
            <legend>Types d’exploitation</legend>
            <div v-for="type in types" :key="type.exploitationTypeId" class="checkbox-group">
            <input
                :id="`type-${type.exploitationTypeId}`"
                v-model="form.exploitationTypeIds"
                type="checkbox"
                :value="type.exploitationTypeId"
            />
            <label :for="`type-${type.exploitationTypeId}`">{{ type.exploitationTypeName }}</label>
            </div>
            <p v-if="isSubmitted && errors.exploitationTypeIds" class="field-error">
            {{ errors.exploitationTypeIds }}
            </p>
        </fieldset>
    </div>
  
    <p v-if="successMessage" class="message-success" role="status">{{ successMessage }}</p>
    </form>
    <section v-else class="photographies-placeholder">
        <h2>Photographies</h2>
        <p>
        La gestion des photographies sera affichée dans cet onglet. Les images actuelles sont
        conservées lorsque vous enregistrez les informations générales.
        </p>
    </section>

    <div class="button-group">
        <RegistrationStatus :is-saved="false"/>
        <button class="button-secondary" @click="">
            Annuler
        </button>
        <button 
            class="button-primary"
            :disabled="!isFormModified"
            @click="nextStepHandler"
        >
            {{ place.status === 'published' ? 'Publier' : 'Enregistrer' }}
        </button>

    </div>
  {{ form }}
  <br>
  <br>
  {{ place }}
  <br>
  <br>
  {{ isFormModified }}
</template>

<style scoped>
.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container {
    display: flex;
    align-items: center;
    gap: var(--space-large);
}

.tab-container {
  display: flex;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--champagne);
}
.tab-title {
  font-family: 'Baskervville Regular', serif;
  font-size: 2rem;
  width: 100%;
}

.tab-title:hover {
    color: var(--champagne);
}

.tab-active {
  color: var(--champagne);
}
.form-container {
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(0, 1fr);
  gap: var(--space-xtralarge);
  max-width: 1000px;
  padding-top: var(--space-large);
}
.form-columns {
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(0, 1fr);
  gap: var(--space-xtralarge);
}
.form-columns > div {
  display: flex;
  flex-direction: column;
  gap: var(--space-medium);
}
.field-error,
.message-error {
  color: var(--red-soft, #b42318);
  margin: var(--space-small) 0 0;
}
.field-help {
  color: var(--text-secondary);
  margin: var(--space-small) 0 0;
}
.message-success {
  color: var(--green-soft);
}
fieldset[aria-invalid='true'] {
  border-color: var(--red-soft, #b42318);
}
.photographies-placeholder {
  padding-top: var(--space-large);
}
@media (max-width: 1199px) {
  .form-columns {
    grid-template-columns: 1fr;
  }
}
</style>
