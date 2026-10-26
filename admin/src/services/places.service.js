import { apiFetch } from "./api.service.js"

export const getAll= async () => {
    const response = await apiFetch('api/admin/places')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les lieux')
    }
    
    const places = await response.json();

    return places;
}