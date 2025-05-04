import axios from 'axios';
import Cookies from 'js-cookie';
import API_BASE_URL from "../../config";
const BASE_URL = `${API_BASE_URL}/api/offline`;

export const getAllProductDetails = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOfflineOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPointsByPhone = async (phone) => {
  try {
    const response = await axios.get(`${BASE_URL}/points`, {
      params: { phone },
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const applyDiscount = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL}/orders/apply-discount`, orderData, {
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProductToOfflineCart = async (userId, productDetailId, quantity = 1, tabId) => {
  try {
    const response = await axios.post(`${BASE_URL}/cart/add-product`, null, {
      params: { userId, productDetailId, quantity, tabId },
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromOfflineCart = async (userId, productDetailId, tabId) => {
  try {
    await axios.delete(`${BASE_URL}/cart/remove-product`, {
      params: { userId, productDetailId, tabId },
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
  } catch (error) {
    throw error;
  }
};

export const getOfflineCartDetails = async (userId, tabId) => {
  try {
    const response = await axios.get(`${BASE_URL}/cart`, {
      params: { userId, tabId },
      headers: { 'Authorization': `Bearer ${Cookies.get('accessToken')}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};