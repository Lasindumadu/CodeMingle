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

    // Check if user is enrolled in a course
    checkUserEnrollment(userId, courseId){
        return axios.get(`${ENROLLMENT_BASE_REST_API_URL}/check/${userId}/${courseId}`);
    }

    // Get enrollments for a specific user
    getUserEnrollments(userId){
        return axios.get(`${ENROLLMENT_BASE_REST_API_URL}/user/${userId}`);
    }

    // Enroll user in course
    enrollUserInCourse(userId, courseId){
        return axios.post(ENROLLMENT_BASE_REST_API_URL, {
            userId: userId,
            courseId: courseId,
            enrollmentDate: new Date().toISOString().split('T')[0]
        });
    }
}

const enrollmentService = new EnrollmentService();
export default enrollmentService;
