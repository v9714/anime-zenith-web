/**
 * URL Encoder/Decoder utilities using Base64
 * Used to obfuscate anime and episode IDs in URLs
 */

// Encode data to base64 URL-safe string
export const encodeUrlParam = (data: string | number): string => {
    try {
        const str = String(data);
        // Use btoa for base64 encoding and make it URL-safe
        const base64 = btoa(str);
        // Replace characters that are not URL-safe
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (error) {
        console.error('Error encoding URL param:', error);
        return String(data);
    }
};

// Decode base64 URL-safe string back to original data
export const decodeUrlParam = (encoded: string): string => {
    try {
        // Restore URL-safe characters back to standard base64
        let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if necessary
        while (base64.length % 4) {
            base64 += '=';
        }
        return atob(base64);
    } catch (error) {
        console.error('Error decoding URL param:', error);
        return encoded;
    }
};

// Encode anime ID and episode number together
export const encodeWatchUrl = (animeId: string | number, episodeNumber: string | number): string => {
    const data = `${animeId}:${episodeNumber}`;
    return encodeUrlParam(data);
};

// Decode watch URL back to anime ID and episode number
export const decodeWatchUrl = (encoded: string): { animeId: string; episodeNumber: string } => {
    try {
        const decoded = decodeUrlParam(encoded);
        const [animeId, episodeNumber] = decoded.split(':');
        return { animeId: animeId || '', episodeNumber: episodeNumber || '1' };
    } catch (error) {
        console.error('Error decoding watch URL:', error);
        return { animeId: '', episodeNumber: '1' };
    }
};

// Generate encoded watch URL path
export const generateWatchUrl = (animeId: string | number, episodeNumber: string | number): string => {
    const encoded = encodeWatchUrl(animeId, episodeNumber);
    return `/watch/${encoded}`;
};
