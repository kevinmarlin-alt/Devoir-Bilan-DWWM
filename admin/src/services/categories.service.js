import { apiFetch } from "./api.service.js"

export const getAll = async () => {
    const response = await apiFetch('api/admin/categories')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les catégories')
    }
    
    const { categories } = await response.json();

    return categories;
}