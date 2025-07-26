import { BACKEND_API_Image_URL } from "./constants";

const getImageUrl = (path) => {
    if (!path) return '/default-image.jpg';
    return `${BACKEND_API_Image_URL}/${path.replace(/^\//, '')}`;
};

export { getImageUrl };