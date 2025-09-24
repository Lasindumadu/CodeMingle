import axios from 'axios'

const COMMENT_BASE_REST_API_URL = 'http://localhost:8080/api/v1/comments';

class CommentService{

    getAllComments(){
        return axios.get(COMMENT_BASE_REST_API_URL)
    }

    createComment(comment){
        const commentPayload = {
            userId: comment.userId,
            lessonId: comment.lessonId,
            content: comment.content
        }
        return axios.post(COMMENT_BASE_REST_API_URL, commentPayload)
    }

    getCommentById(commentId){
        return axios.get(COMMENT_BASE_REST_API_URL + '/' + commentId);
    }

    updateComment(commentId, comment){
        // Convert userId and lessonId to nested objects as expected by backend
        const commentPayload = {
            user: { userId: comment.userId },
            lesson: { lessonId: comment.lessonId },
            content: comment.content
        }
        return axios.put(COMMENT_BASE_REST_API_URL + '/' + commentId, commentPayload);
    }

    deleteComment(commentId){
        return axios.delete(COMMENT_BASE_REST_API_URL + '/' + commentId);
    }
}

const commentService = new CommentService();
export default commentService;
