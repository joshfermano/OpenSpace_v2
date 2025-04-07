export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_URL}${endpoint}`;

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  });

  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers,
  };

  console.log(`Fetching ${endpoint} with options:`, {
    method: options.method || 'GET',
    credentials: fetchOptions.credentials,
  });

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:expired'));
    }

    return response;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);

    if (
      error instanceof TypeError &&
      error.message.includes('Failed to fetch')
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Network error',
          message: 'Unable to connect to server. Please try again later.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    throw error;
  }
};
