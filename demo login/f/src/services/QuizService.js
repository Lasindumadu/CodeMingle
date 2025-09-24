import axios from 'axios'

const QUIZ_BASE_REST_API_URL = 'http://localhost:8080/api/v1/quizzes';

class QuizService{

    getAllQuizzes(){
        return axios.get(QUIZ_BASE_REST_API_URL)
    }

    createQuiz(quiz){
        return axios.post(QUIZ_BASE_REST_API_URL, quiz)
    }

    getQuizById(quizId){
        return axios.get(QUIZ_BASE_REST_API_URL + '/' + quizId);
    }

    updateQuiz(quizId, quiz){
        return axios.put(QUIZ_BASE_REST_API_URL + '/' + quizId, quiz);
    }

    deleteQuiz(quizId){
        return axios.delete(QUIZ_BASE_REST_API_URL + '/' + quizId);
    }
}

const quizService = new QuizService();
export default quizService;
