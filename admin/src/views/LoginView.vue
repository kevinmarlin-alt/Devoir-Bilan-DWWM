<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router'

const router = useRouter()

const info = ref('');

async function submitHandle(event) {
    event.preventDefault();

    info.value = 'Connexion en cours...';
    
    const formElement = document.querySelector('form');
    const [email, password]  = new FormData(formElement).values();
    
    const playload = {
            email,
            password
        };

    try {
        const response = await fetch('http://localhost:3000/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(playload)
            }
        );
        
        const data = await response.json();

        if(!response.ok) {
            if (data.error?.code === 'INVALID_CREDENTIALS') {
                info.value = 'Adresse e-mail ou mot de passe incorrect';
                return
            }

            info.value = 'Une erreur est survenue'
            return
        }

        info.value = 'Connexion réussie';

        router.push({ name: 'dashboard_home' });

    } catch (error) {
        info.value = error.message
        
    }

    
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