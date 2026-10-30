<script setup>
defineProps({
    headers: Array,
    data: Array,
    rowKey: String
})
</script>

<template>
    <p v-if="data.length === 0">
        Auncune catégorie ne correspond aux filtres.
    </p>
    <table v-else>
        <tr>
            <th
                v-for="(header, i) in headers"
                :key="`${header}${i}`"
            >
                {{ header }}
            </th>
            <th>Actions</th>
        </tr>
        <tr
            v-for="entity in data"
            :key="entity[rowKey]"
        >
            <td
                v-for="(header, i) in headers"
                :key="`${header}-${i}`"
            >
                <slot :name="`column${i}`" :entity="entity"></slot>
            </td>
            <td>
                <slot name="actions" :entity="entity"></slot>
            </td>
        </tr>
    </table>
</template>
