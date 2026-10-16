import { apiFetch } from "./api.service.js"

export const getAll = async () => {
    const response = await apiFetch('api/admin/categories')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les catégories')
    }
    
    const { categories } = await response.json();

    return categories;
}

export const getCategoryById = async (categoryId) => {
    const response = await apiFetch(`api/admin/categories/${categoryId}`);

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de la récupération de la catégorie.')
    }

    const category = await response.json();

    return category
}

export const addCategory = async (name, description) => {
    const response = await apiFetch('api/admin/categories/add', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            categoryName: name,
            description: description
        })
    })

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de l\'enregistrement de la nouvelle catégorie.')
    }

    const { category } = await response.json();

    return category;
}

export const updateCategory = async (categoryId, data) => {
    const response = await apiFetch(`api/admin/categories/${categoryId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify( data )
    })

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de l\'enregistrement de la nouvelle catégorie.')
    }
}

export const deteleCategory = async (entity) => {
    const { categoryId } = entity

    const response = await apiFetch(`api/admin/categories/${categoryId}`, {
        method: 'DELETE'
    })

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de la suppression de la catégorie.')
    }    
}