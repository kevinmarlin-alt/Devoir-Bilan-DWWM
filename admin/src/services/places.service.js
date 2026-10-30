import { apiFetch } from "./api.service.js"

export const getAllPlaces= async () => {
    const response = await apiFetch('api/admin/places')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les lieux')
    }
    
    const places = await response.json();

    return places;
}

export const detelePlace = async (placeId) => {
    const response = await apiFetch(`api/admin/places/${placeId}`, {
        method: 'DELETE',
    })

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de la suppression du lieu.')
    }}