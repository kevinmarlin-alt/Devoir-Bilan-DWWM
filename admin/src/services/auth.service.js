import { apiFetch } from "./api.service.js";

export const getAuthenticatedUser = async () => {

    const response = await apiFetch('api/auth/me');
    
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

export const login = async (email, password) => {
  const response = await apiFetch('api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  const data = await response.json()

  if (!response.ok) {
    return {
      success: false,
      error: data.error
    }
  }

  return {
    success: true,
    user: data.user
  }
}

export const logout = async () => {
  await apiFetch('api/auth/logout', {
    method: 'POST'
  })
}