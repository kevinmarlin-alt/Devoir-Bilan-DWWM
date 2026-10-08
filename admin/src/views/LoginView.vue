<script setup>
import { login } from '@/services/auth.service';
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const info = ref('');

async function submitHandle(event) {
    event.preventDefault();

    info.value = 'Connexion en cours...';
    
    const formElement = document.querySelector('form');
    const [email, password]  = new FormData(formElement).values();
    
    const result = await login(email, password);

    if(!result.success) {
        info.value = 'Adresse e-mail ou mot de passe incorrect'
        return
    }

    router.push({ name: 'dashboard_home' });
}

</script>

<template>
    <form action="#" @submit.prevent="submitHandle">
        <div>
            <label for="email">Adresse e-mail</label>
            <input 
                type="email" 
                name="email" 
                id="email"
                value="admin@private-place.fr"
            >
        </div>
        <div>
            <label for="password">Mot de passe</label>
            <input 
                type="password" 
                name="password" 
                id="password"
                value="test"
            >
        </div>
        <button type="submit">Se connecter</button>
        <span class="info-form">{{ info }}</span>
    </form>

</template>

<style scoped>
    div {
        display: flex;
    }
</style>