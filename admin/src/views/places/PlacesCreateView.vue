<script setup>
import { ref } from 'vue';
import ProgressBarCreatePlace from '@/components/ProgressBarCreatePlace.vue';

// Cette valeur est la source de vérité de l'avancement du formulaire.
const currentStep = ref(1);
</script>

<template>
    <nav>
        <RouterLink 
            to="/admin/places"
            class="button-light"
        >
            Retour à la liste
        </RouterLink>
    </nav>
    <h1>Nouveau lieu</h1>
    <ProgressBarCreatePlace :current-step="currentStep"/>
</template>

<style>
.progress_bar {
    padding: 0 3rem;
    width: auto;
}
</style>
