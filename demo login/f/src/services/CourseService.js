import axios from 'axios'

const COURSE_BASE_REST_API_URL = 'http://localhost:8080/api/v1/courses';

class CourseService{

    getAllCourses(){
        return axios.get(COURSE_BASE_REST_API_URL)
    }

    createCourse(course){
        return axios.post(COURSE_BASE_REST_API_URL, course)
    }

    getCourseById(courseId){
        return axios.get(COURSE_BASE_REST_API_URL + '/' + courseId);
    }

    updateCourse(courseId, course){
        return axios.put(COURSE_BASE_REST_API_URL + '/' + courseId, course);
    }

    deleteCourse(courseId){
        return axios.delete(COURSE_BASE_REST_API_URL + '/' + courseId);
    }
}

const courseService = new CourseService();
export default courseService;
