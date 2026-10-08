import { apiFetchGet } from "./api.service.js";

export const getAuthenticatedUser = async () => {

    const response = await apiFetchGet('api/auth/user');
    
    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(
            "Impossible de vérifier l'authentification"
        );
    }

    const user = await response.json();

    return user;
};