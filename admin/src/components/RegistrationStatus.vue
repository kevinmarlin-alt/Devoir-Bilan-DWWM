<script setup>
defineProps({
    isSaved: Boolean
})
</script>

<template>
    <div :class="`registration-status ${ isSaved ? 'success' : 'warning' }`">
        <span :class="`tag-status tag-status-${ isSaved ? 'success' : 'warning' }`"></span>
        {{ isSaved ? 'Enregisté' : 'Non enregistré' }}
    </div>
</template>

<style scoped>

.registration-status {
    width: 100%;
}

.tag-status {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
    border-radius: 10px;
}

.tag-status-warning  {
    background-color: var(--amber-warm);
}
.tag-status-success  {
    background-color: var(--green-soft);
}

.warning  {
    color: var(--amber-warm);
}
.success  {
    color: var(--green-soft);
}

</style>