import axios from 'axios';

const axiosClient = axios.create({
  timeout: 5000, // Optional timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
