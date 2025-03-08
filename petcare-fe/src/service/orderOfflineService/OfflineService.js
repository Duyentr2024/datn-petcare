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

