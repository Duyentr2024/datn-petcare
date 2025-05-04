const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            REFRESH_TOKEN: '/auth/refresh-token',
        },
        PRODUCTS: {
            BASE: '/products',
            DETAILS: '/productDetails',
            CATEGORIES: '/categories',
            BRANDS: '/brands',
        },
        ORDERS: {
            BASE: '/orders',
            USER_ORDERS: '/orders/user',
            MANAGE: '/orders/manage',
        },
        PAYMENTS: {
            MOMO: '/momo',
            VNPAY: '/vnpay',
        },
        BOOKING: {
            TIME_SLOTS: '/time-slots',
            APPOINTMENTS: '/appointments',
        }
    }
};

export default API_CONFIG; 