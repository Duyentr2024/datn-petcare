import Cookies from "js-cookie"; // Import js-cookie để lấy token
import API_BASE_URL from '../../config';

const BASE_URL = `${API_BASE_URL}/api/vet/pets`; // Sử dụng biến từ config

export const getAllPets = async (page = 0, size = 10) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch pets: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Error fetching pets');
    }
};

export const getPetById = async (id) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Pet not found');
            }
            throw new Error(`Failed to fetch pet: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Error fetching pet by ID');
    }
};

export const createPet = async (petData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(petData),
        });

        if (!response.ok) {
            throw new Error(`Failed to create pet: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Error creating pet');
    }
};

export const updatePet = async (id, petData) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(petData),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Pet not found');
            }
            throw new Error(`Failed to update pet: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Error updating pet');
    }
};

export const deletePet = async (id) => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Pet not found');
            }
            throw new Error(`Failed to delete pet: ${response.statusText}`);
        }

        return true; // Backend returns 204 No Content on success
    } catch (error) {
        throw new Error(error.message || 'Error deleting pet');
    }
};

export const getAllPetWeights = async () => {
    try {
        const token = Cookies.get("accessToken"); // Lấy token từ cookie
        const response = await fetch(`${BASE_URL}/weights`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch pet weights: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(error.message || 'Error fetching pet weights');
    }
};