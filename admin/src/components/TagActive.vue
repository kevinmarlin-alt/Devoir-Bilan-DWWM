<script setup>
const props = defineProps({
    status: Boolean
})



</script>

<template>
    <div :class="`tag ${status ? 'tag-active' : 'tag-disable'}`">
        <p class="tag-description">
            <span :class="status ? 'span-active' : 'span-disable'"></span>{{ status ? 'Active' : 'Inactive' }}
        </p>
    </div>
</template>

<style>
.tag {
    display: inline-block;
    padding: var(--space-small) var(--space-medium);
    font-size: 0.8rem;
    border-radius: var(--radius-medium);
    width: auto;
}

.tag-active {
    background-color: var(--green-dark);
    border: 1px solid var(--green-soft);
}

.tag-disable {
    background-color: var(--red-dark);
    border: 1px solid var(--red-soft);
}

.tag span {
    display: inline-block;
    width: .2em;
    height: .2em;
    border-radius: .5em;
    margin-right: 0.25em;
}

.span-active {
    background-color: var(--green-soft);
}

.span-disable {
    background-color: var(--red-soft);
}


</style>