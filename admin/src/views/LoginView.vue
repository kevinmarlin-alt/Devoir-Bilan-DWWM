<script setup>
import { login } from '@/services/auth.service';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'

import Footer from '@/components/Footer.vue';

const router = useRouter();

const email = ref('');
const password = ref('');

const info = ref({
    success: true,
    message: ''
});

const isLoginDisabled = computed(() => {
    return !email.value.trim() || !password.value
})

async function submitHandle() {
    info.value.success = true;
    info.value.message = 'Connexion en cours...';

    const result = await login(email.value, password.value);

    console.log(result)

    if(!result.success) {
        info.value.success = false;
        info.value.message = 'Adresse e-mail ou mot de passe incorrect'
        return
    }

    info.value.success = true;
    info.value.message = 'Connexion réussie...';

    router.push({ name: 'dashboard_home' });
}

</script>

<template>
    <div class="login-page">
        <div class="login">
            <div class="login__content">
                <img
                    src="/assets/images/logo-brand.png"
                    alt="Logo de Private Place"
                    width="1920"
                    height="600"
                >
                <p>Espace administrateur</p>
                <form action="#" @submit.prevent="submitHandle">
                    <div class="input-group">
                        <label for="email">Adresse e-mail</label>
                        <input
                            v-model="email"
                            type="email"
                            name="email"
                            id="email"
                            placeholder="exemple@email.fr"
                            required
                        >
                    </div>
                    <div class="input-group">
                        <label for="password">Mot de passe</label>
                        <input
                            v-model="password"
                            type="password"
                            name="password"
                            id="password"
                            required
                        >
                    </div>
                    <button 
                        type="submit" 
                        class="button-primary" 
                        :disabled="isLoginDisabled"
                    >
                        Connexion
                    </button>

                    <span 
                        :class="`info-connexion ${info.success ? 'green' : 'red'}`"
                    >
                        {{ info.message }}
                    </span>
                </form>
            </div>
            <Footer/>
        </div>
    </div>

</template>

<style>

.login-page {
    display: flex;
    flex-direction: row-reverse;
    min-height: 100vh;
    background-image: url("/assets/images/connexion-background.jpg");
    background-size: cover;
}

.login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 600px;
    padding: 0 100px;
    background-color: var(--app-background);
    border-left: 2px solid var(--champagne);
}

.login__content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--app-spacer);
}

.info-connexion {
    font-size: 0.7rem;
    color: var(--red-soft);
}

.green {
    color: var(--green-soft);
}
.red {
    color: var(--red-soft);
}
    
</style>