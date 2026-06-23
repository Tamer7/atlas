import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let csrfInitialised = false;

const ensureCsrf = async () => {
  if (!csrfInitialised) {
    await apiClient.get('/sanctum/csrf-cookie');
    csrfInitialised = true;
  }
};

apiClient.interceptors.request.use(async (config) => {
  const mutating = ['post', 'put', 'patch', 'delete'].includes(
    (config.method || '').toLowerCase()
  );
  if (mutating) {
    await ensureCsrf();
  }
  return config;
});

// Reset on logout so next login refetches CSRF
export const resetCsrf = () => {
  csrfInitialised = false;
};
