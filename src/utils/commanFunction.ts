import { BACKEND_API_Image_URL } from "./constants";

const getImageUrl = (path) => {
    if (!path) return '/default-image.jpg';
    
    // If it's an external URL (starts with http:// or https://), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // If it's an internal database image, prepend BACKEND_API_Image_URL
    return `${BACKEND_API_Image_URL}/${path.replace(/^\//, '')}`;
};

export { getImageUrl };