import axios from 'axios'

const LESSON_BASE_REST_API_URL = 'http://localhost:8080/api/v1/lessons';

class LessonService{

    getAllLessons(){
        return axios.get(LESSON_BASE_REST_API_URL)
    }

    createLesson(lesson){
        return axios.post(LESSON_BASE_REST_API_URL, lesson)
    }

    getLessonById(lessonId){
        return axios.get(LESSON_BASE_REST_API_URL + '/' + lessonId);
    }

    updateLesson(lessonId, lesson){
        return axios.put(LESSON_BASE_REST_API_URL + '/' + lessonId, lesson);
    }

    deleteLesson(lessonId){
        return axios.delete(LESSON_BASE_REST_API_URL + '/' + lessonId);
    }

    getLessonsByCourseId(courseId){
        return axios.get(LESSON_BASE_REST_API_URL + '/course/' + courseId);
    }
}

const lessonService = new LessonService();
export default lessonService;
