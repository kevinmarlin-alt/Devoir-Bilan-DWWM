<script setup>

const formElement = document.querySelector('form');

function submitHandle(event) {
    event.preventDefault();

    const formData = new FormData(formElement);
    console.log(formData)
    
}

</script>

<template>
    <form >
        <div>
            <label for="email">Adresse e-mail</label>
            <input 
                type="email" 
                name="email" 
                id="email"
                value="exemple@mail.com"
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
        <button type="submit" @submit="submitHandle">Se connecter</button>
    </form>

</template>

<style scoped>
    div {
        display: flex;
    }
</style>