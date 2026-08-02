const API_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000";

export function getImageUrl(path?: string | null) {
  if (!path) {
    return "";
  }

  // Already a full URL
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_URL}/storage/${path}`;
}
