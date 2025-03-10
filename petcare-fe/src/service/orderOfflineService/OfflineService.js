import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/offline';

export const getAllProductDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOfflineOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPointsByPhone = async (phone) => {
  try {
    const response = await axios.get(`${BASE_URL}/points`, { params: { phone } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applyDiscount = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders/apply-discount`, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProductToOfflineCart = async (userId, productDetailId, quantity = 1) => {
  try {
    const response = await axios.post(`${BASE_URL}/cart/add-product`, null, {
      params: { userId, productDetailId, quantity },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromOfflineCart = async (userId, productDetailId) => {
  try {
    await axios.delete(`${BASE_URL}/cart/remove-product`, {
      params: { userId, productDetailId },
    });
  } catch (error) {
    throw error;
  }
};

export const getOfflineCartDetails = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/cart`, { params: { userId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

