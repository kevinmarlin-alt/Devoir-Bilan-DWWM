import { apiFetch } from "./api.service"

export const getAvailableImages = async () => {
    const response = await apiFetch('api/admin/images/available');

    if (!response.ok) {
        throw new Error('Impossible de récupérer les lieux')
    }
    
    const images = await response.json();

    return images;
}