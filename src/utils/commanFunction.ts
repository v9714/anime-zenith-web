import { BACKEND_API_Image_URL } from "./constants";

const getImageUrl = (path: string | undefined, customBaseUrl?: string): string | undefined => {
    if (!path) return undefined;

    // If it's an external URL (starts with http:// or https://), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Normalize path (convert backslashes to forward slashes)
    const normalizedPath = path.replace(/\\/g, '/');

    // Use customBaseUrl if provided, otherwise fallback to BACKEND_API_Image_URL
    const baseUrl = customBaseUrl || BACKEND_API_Image_URL;

    // Remove leading slash from path and trailing slash from base URL to ensure exactly one slash
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    return `${cleanBase}${cleanPath}`;
};

export { getImageUrl };