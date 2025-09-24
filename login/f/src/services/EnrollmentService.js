import axios from 'axios'

const ENROLLMENT_BASE_REST_API_URL = 'http://localhost:8080/api/v1/enrollments';

class EnrollmentService{

    getAllEnrollments(){
        return axios.get(ENROLLMENT_BASE_REST_API_URL)
    }

    createEnrollment(enrollment){
        return axios.post(ENROLLMENT_BASE_REST_API_URL, enrollment)
    }

    getEnrollmentById(enrollmentId){
        return axios.get(ENROLLMENT_BASE_REST_API_URL + '/' + enrollmentId);
    }

    updateEnrollment(enrollmentId, enrollment){
        return axios.put(ENROLLMENT_BASE_REST_API_URL + '/' + enrollmentId, enrollment);
    }

    deleteEnrollment(enrollmentId){
        return axios.delete(ENROLLMENT_BASE_REST_API_URL + '/' + enrollmentId);
    }
}

const enrollmentService = new EnrollmentService();
export default enrollmentService;
