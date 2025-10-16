import { BACKEND_API_Image_URL } from "./constants";

const getImageUrl = (path: string | undefined): string => {
    if (!path) return '/placeholder.svg';

    // If it's an external URL (starts with http:// or https://), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // If it's an internal database image, prepend BACKEND_API_Image_URL
    // Remove leading slash to avoid double slashes
    return `${BACKEND_API_Image_URL}${path.startsWith('/') ? path : '/' + path}`;
};

export { getImageUrl };