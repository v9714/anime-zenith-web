import axios from 'axios';
import { COMMENTS_API_BASE_URL } from '@/utils/constants';

// Comments API Base URL

// Comment interface matching backend response
export interface Comment {
    id: string;
    content: string;
    userId: string;
    episodeId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        displayName: string;
        avatarUrl?: string | null;
    };
    replyCount?: number;
}

export interface CommentsResponse {
    success: boolean;
    data: {
        comments: Comment[];
        pagination?: {
            currentPage: number;
            totalPages: number;
            totalComments: number;
            hasMore: boolean;
        };
    };
    message?: string;
}

export interface RepliesResponse {
    success: boolean;
    data: {
        replies: Comment[];
    };
    message?: string;
}

export interface CreateCommentPayload {
    episodeId: string;
    content: string;
    parentId?: string | null;
}

export interface CreateCommentResponse {
    success: boolean;
    message: string;
    data: Comment;
}

// Get comments for an episode
// Get replies for a comment
export const getReplies = async (commentId: string): Promise<RepliesResponse> => {
    try {
        const response = await axios.get(`${COMMENTS_API_BASE_URL}/${commentId}/replies`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching replies:', error);
        throw error.response?.data || error;
    }
};

// Create a new comment or reply
export const createComment = async (
    payload: CreateCommentPayload,
    accessToken: string
): Promise<CreateCommentResponse> => {
    try {
        const response = await axios.post(
            COMMENTS_API_BASE_URL,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('Error creating comment:', error);
        throw error.response?.data || error;
    }
};

// Update a comment
export const updateComment = async (
    commentId: string,
    content: string,
    accessToken: string
): Promise<CreateCommentResponse> => {
    try {
        const response = await axios.patch(
            `${COMMENTS_API_BASE_URL}/${commentId}`,
            { content },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('Error updating comment:', error);
        throw error.response?.data || error;
    }
};

// Delete a comment
export const deleteComment = async (
    commentId: string,
    accessToken: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await axios.delete(
            `${COMMENTS_API_BASE_URL}/${commentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        throw error.response?.data || error;
    }
};
