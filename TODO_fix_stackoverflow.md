# Fix StackOverflowError in Course API

## Problem
- CourseController was returning Course entities directly, causing StackOverflowError during JSON serialization due to recursive relationships and Lombok @Data toString() method.

## Solution
- Created CourseDTO.java with basic fields (courseId, title, description, category, createdAt)
- Updated CourseController.java to return CourseDTO objects instead of Course entities in:
  - getAllCourses()
  - getCourseById()
  - updateCourse()

## Changes Made
- [x] Created CourseDTO.java
- [x] Added import for CourseDTO in CourseController.java
- [x] Updated getAllCourses() to return List<CourseDTO>
- [x] Updated getCourseById() to return ResponseEntity<CourseDTO>
- [x] Updated updateCourse() to return ResponseEntity<CourseDTO>

## Testing
- [x] Run the backend and test the /api/v1/courses endpoint to ensure no StackOverflowError
- [x] Verify that the API returns proper JSON responses
- [x] Check that frontend components still work with the new DTO structure

## Results
- Backend starts successfully without errors
- /api/v1/courses endpoint returns CourseDTO objects without StackOverflowError
- All other endpoints continue to work normally
- JSON serialization is working properly for CourseDTO objects
