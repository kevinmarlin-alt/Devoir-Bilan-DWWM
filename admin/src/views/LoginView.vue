<script setup>
import { ref } from 'vue';

const info = ref('');

async function submitHandle(event) {
    event.preventDefault();
    
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
        
        if(!response.ok) {
            throw new Error('Erreur type 2')
        }

        const data = await response.json();
        console.log(data)
        info.value = data.message

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