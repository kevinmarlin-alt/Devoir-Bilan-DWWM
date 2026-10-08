<script setup>
import { RouterLink, RouterView } from "vue-router";

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
        <div class="app-body">
            <aside class="app-sidebar">
                <nav class="sidebar-nav">
                    <RouterLink to="/admin/home">
                        Accueil
                    </RouterLink>
                </nav>
            </aside>
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
.app-header__logo {
    width: 320px;
}

</style>