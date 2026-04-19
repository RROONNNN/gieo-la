import { ENDPOINTS } from "./endpoints";
import { BASE_URL } from "./endpoints";

const TOKEN_KEY = "la_lanh_token";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Uploads a single image file to the server.
 * Returns the URL of the uploaded image on success.
 * Throws an Error with a Vietnamese message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${ENDPOINTS.UPLOAD.IMAGE}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Tải ảnh lên thất bại. Vui lòng thử lại.");
  }

  return `${BASE_URL}${data.data.url}` as string;
}
