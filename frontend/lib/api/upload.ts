import { ENDPOINTS } from "./endpoints";
import { BASE_URL } from "./endpoints";
import { getAccessToken } from "./client";

/**
 * Uploads a single image file to the server.
 * Returns the URL of the uploaded image on success.
 * Throws an Error with a Vietnamese message on failure.
 */
export async function uploadImage(file: File): Promise<string> {
  const token = getAccessToken();
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

  return `${data.data.url}` as string;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  return Promise.all(
    files.map(async (file) => {
      const token = getAccessToken();
      const formData = new FormData();
      formData.append("file", file);

      const headers: HeadersInit = {};
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}${ENDPOINTS.UPLOAD.FILE}`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Tải file "${file.name}" lên thất bại. Vui lòng thử lại.`
        );
      }

      return data.data.url as string;
    })
  );
}

/**
 * Admin-only: uploads an inline image for embedding inside news post content.
 * Returns the Cloudinary URL.
 */
export async function uploadNewsContentImage(file: File): Promise<string> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("image", file);

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${ENDPOINTS.UPLOAD.NEWS_CONTENT_IMAGE}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Tải ảnh nội dung thất bại. Vui lòng thử lại.");
  }

  return data.data.url as string;
}