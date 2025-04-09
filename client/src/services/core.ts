export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };

  const config = {
    ...options,
    credentials: 'include' as RequestCredentials,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (
    options.body &&
    typeof options.body !== 'string' &&
    !(options.body instanceof FormData)
  ) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Handle token expiration
  if (response.status === 401) {
    // You could implement token refresh logic here
    // Or simply clear the token and redirect to login
    console.warn('Authentication token may be expired');
  }

  return response;
};
