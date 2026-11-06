import { apiFetch } from "./api.service.js"

export const getAllPlaces= async () => {
    const response = await apiFetch('api/admin/places')

    if (!response.ok) {
        throw new Error('Impossible de récupérer les lieux')
    }
    
    const places = await response.json();

    return places;
}

export const getAllImages = async () => {
    const response = await apiFetch('api/admin/images');

    if (!response.ok) {
        throw new Error('Impossible de récupérer les images');
    }

    return response.json();
}

export const createPlace = async (data) => {
    const response = await apiFetch('api/admin/places', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error.message ?? 'Une erreur est survenue lors de la création du lieu.');
    }

    return await response.json();
}

export const updatePlace = async (placeId, data) => {
    const response = await apiFetch(`api/admin/places/${placeId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const {error} = await response.json();
        throw new Error(error.message ?? 'Une erreur est survenue lors de la mise à jour du lieu.');
    }

    return await response.json();
}

export const detelePlace = async (placeId) => {
    const response = await apiFetch(`api/admin/places/${placeId}`, {
        method: 'DELETE',
    })

    if(!response.ok) {
        throw new Error('Une erreur est survenue lors de la suppression du lieu.')
    }}
