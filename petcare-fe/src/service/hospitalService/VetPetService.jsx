// VetPetService.js
import API_BASE_URL from '../../config';
const BASE_URL = `${API_BASE_URL}/api/pets`; // Sử dụng biến từ config


/**
 * Fetch all pets with pagination
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Number of items per page (default: 10)
 * @returns {Promise} - Promise resolving to the paginated pets data
 */
export const getAllPets = async (page = 0, size = 10) => {
    try {
        const response = await fetch(`${BASE_URL}?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed, e.g., Authorization: `Bearer ${token}`
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

/**
 * Fetch a pet by ID
 * @param {number} id - Pet ID
 * @returns {Promise} - Promise resolving to the pet data
 */
export const getPetById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
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

/**
 * Create a new pet
 * @param {Object} petData - Pet data to create
 * @returns {Promise} - Promise resolving to the created pet data
 */
export const createPet = async (petData) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
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

/**
 * Update a pet by ID
 * @param {number} id - Pet ID
 * @param {Object} petData - Updated pet data
 * @returns {Promise} - Promise resolving to the updated pet data
 */
export const updatePet = async (id, petData) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
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

/**
 * Delete a pet by ID
 * @param {number} id - Pet ID
 * @returns {Promise} - Promise resolving to void
 */
export const deletePet = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
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

/**
 * Fetch all pet weights
 * @returns {Promise} - Promise resolving to the list of pet weights
 */
export const getAllPetWeights = async () => {
    try {
        const response = await fetch(`${BASE_URL}/weights`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add authentication headers if needed
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