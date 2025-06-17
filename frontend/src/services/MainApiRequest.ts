import { message } from 'antd';
import axios from 'axios';

// Create an instance of Axios
export const MainApiRequest = axios.create({
    baseURL: 'http://localhost:3000/', // Replace with your desired base URL
    timeout: 60000, // Replace with your desired timeout in milliseconds
    headers: {
        'Content-Type': 'application/json', // Set the Content-Type header to JSON
        // Ngrok allow headers
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Add request interceptor
MainApiRequest.interceptors.request.use(
    (config) => {
        if (localStorage.getItem('token')) {
            config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        }
        return config;
    },
    (error) => {
        // Handle request error here
        return Promise.reject(error);
    }
);

// Add response interceptor
MainApiRequest.interceptors.response.use(
    (response) => {
        // Modify the response data here if needed
        return response;
    },
    (error) => {
        // Handle response error hereif (response.status === 401) {
        if (error.response.status === 401) {
            window.location.href = '/login';
        }
        
        if (error.response.status === 403) {
            window.location.href = '/login';
        }

        // Handle response error here
        if (error.response.status === 404) {
            message.error('404 Not Found');
        }

        if (error.response.status === 500) {
            message.error('500 Internal Server Error');
        }

        if (error.response.status === 503) {
            message.error('503 Service Unavailable');
        }

        if (error.response.status === 504) {
            message.error('504 Gateway Timeout');
        }

        if (error.response.status === 400) {
            message.error('400 Bad Request');
        }

        return Promise.reject(error);
    }
);
