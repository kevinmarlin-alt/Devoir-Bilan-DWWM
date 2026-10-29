<script setup>
const props = defineProps({
    status: {
        type: String,
        required: true,
        validator(value) {
            return ['draft', 'published', 'archived'].includes(value)
        }
    }
})

const statusUI = () => {
    switch (props.status) {
        case 'draft': return 'Brouillon' 
        case 'published': return 'Publié' 
        case 'archived': return 'Archivé' 
    }
}

</script>

<template>
    <div :class="`tag tag-${status}`">
        <p class="tag-description">
            <span :class="`span-${status}`"></span>
            {{ statusUI() }}
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

.tag-draft {
    background-color: var(--amber-dark);
    border: 1px solid var(--amber-warm);
    color: var(--amber-warm);
}

.tag-published {
    background-color: var(--green-dark);
    border: 1px solid var(--green-soft);
    color: var(--green-soft);
}

.tag-archived {
    background-color: var(--black-500);
    border: 1px solid var(--taupe-warm);
    color: var(--taupe-warm);
}

.tag span {
    display: inline-block;
    width: .2em;
    height: .2em;
    border-radius: .5em;
    margin-right: 0.25em;
}

.span-draft {
    background-color: var(--amber-warm);
}

.span-published {
    background-color: var(--green-soft);
}

.span-archived {
    background-color: var(--taupe-warm);
}


</style>