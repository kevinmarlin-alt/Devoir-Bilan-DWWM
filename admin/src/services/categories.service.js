import { apiFetch } from "./api.service.js"
import { toFormateDateTime } from "@/utilities/date.js";

export const getAll = async () => {
    const response = await apiFetch('api/categories')
    
    const { categories } = await response.json();

    categories.forEach(category => {
        category.createdAt = toFormateDateTime(new Date(category.createdAt)) 
    });

    return categories;
}