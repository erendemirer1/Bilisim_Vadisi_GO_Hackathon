export async function authRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("authToken");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const result = response.status === 204 ? {} : await response.json();

  if (!response.ok) {
    throw new Error(result.message || "İşlem başarısız oldu.");
  }

  return result;
}
