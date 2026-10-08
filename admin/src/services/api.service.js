const API_URL = import.meta.env.VITE_API_URL;

export const apiFetchGet = async (path) => {
    return await fetch(`${API_URL}${path}`, {
        method: 'GET',
        credentials: 'include'
    }); 
}
