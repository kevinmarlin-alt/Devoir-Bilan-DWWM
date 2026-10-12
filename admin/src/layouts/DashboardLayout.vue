<script setup>
import { logout } from "@/services/auth.service.js";
import { RouterLink, RouterView, useRouter } from "vue-router";

const router = useRouter();

const logoutHandler = async () => {
    await logout();

    router.push({ name: 'login' });
}

const navHandler = (event) => {
    console.log(event.target)
}

</script>

<template>
    <div class="app-layout">
        <header class="app-header">
            <RouterLink to="/admin/home">
                <img 
                    class="app-header__logo"
                    src="/assets/images/logo-brand.png" 
                    alt="Logo de la marque"
                    height="600"
                    width="1920"
                >
            </RouterLink>
        </header>
        <aside class="app-sidebar">
            <nav class="sidebar-nav">
                <RouterLink to="/admin/home" class="nav-item" @click="navHandler">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house preview-icon">
                            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
                            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                    Tableau de bord
                </RouterLink>
                <RouterLink to="/admin/places" class="nav-item" @click="navHandler">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin preview-icon">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                    Lieux
                </RouterLink>
                <RouterLink to="/admin/categories" class="nav-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folders preview-icon">
                            <path d="M20 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.5a1.5 1.5 0 0 1 1.2.6l.6.8a1.5 1.5 0 0 0 1.2.6z"/>
                            <path d="M3 8.268a2 2 0 0 0-1 1.738V19a2 2 0 0 0 2 2h11a2 2 0 0 0 1.732-1"/>
                        </svg>
                    Catégories
                </RouterLink>
                <RouterLink to="/admin/exploitation-types" class="nav-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-todo preview-icon">
                            <path d="M13 5h8"/>
                            <path d="M13 12h8"/>
                            <path d="M13 19h8"/>
                            <path d="m3 17 2 2 4-4"/>
                            <rect x="3" y="4" width="6" height="6" rx="1"/>
                        </svg>
                    Types d'exploitation
                </RouterLink>
            </nav>
            <button 
                type="button"
                @click="logoutHandler"
                class="button-secondary"
            >
                Déconnexion
            </button>
        </aside>
        <div class="app-body">
            <main class="app-content">
                <RouterView />
            </main>
        </div>
        <footer class="app-footer">
            <p>PRIVATE PLACE</p>
            <small>Copyright Kevin Marlin - <time datetime="2026">2026</time></small>
        </footer>
    </div>
</template>

<style>
.app-layout {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-template-rows: 120px 1fr;
    grid-template-areas: 
        "header header"
        "sidebar main"
        "footer footer";
    padding: 0 2.5rem;
}

.app-header {
    grid-area: header;

}

.app-header__logo {
    height: 100%;
    width: auto;
}

.app-sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    padding-left: 0;
    border-right: 1px solid var(--champagne);
}

.app-body {
    grid-area: main;
    display: flex;
    padding-left: 2.5rem;

}


.sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.nav-item {
    display: flex;
    align-items: center;
}

.nav-item:hover {
    color: var(--champagne);
    text-decoration: underline;
}
.nav-item svg {
    margin-right: 1rem;
}

.app-footer {
    grid-area: footer;
}

.router-link-active {
    color: var(--champagne);
}

</style>