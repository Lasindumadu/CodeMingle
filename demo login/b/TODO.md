# TODO: Remove LessonProgress and QuizAttempt from Project

## Backend Files to Delete
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/model/LessonProgress.java
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/controller/LessonProgressController.java
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/repository/LessonProgressRepository.java
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/model/QuizAttempt.java
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/controller/QuizAttemptController.java
- [x] Delete codemingle-backend/src/main/java/com/example/codemingle_backend/repository/QuizAttemptRepository.java

## Frontend Files to Delete
- [x] Delete codemingle-frontend/src/services/LessonProgressService.js
- [x] Delete codemingle-frontend/src/components/ListLessonProgressComponent.js
- [x] Delete codemingle-frontend/src/components/AddLessonProgressComponent.js
- [x] Delete codemingle-frontend/src/services/QuizAttemptService.js
- [x] Delete codemingle-frontend/src/components/ListQuizAttemptComponent.js
- [x] Delete codemingle-frontend/src/components/AddQuizAttemptComponent.js

## Refactor References
- [x] Remove references to LessonProgress and QuizAttempt from other backend files (e.g., Quiz.java, controllers)
- [x] Remove references from frontend files (e.g., App.js, other components)
- [x] Fix missing getters/setters in models by adding Lombok annotations
- [x] Update any navigation or routing that includes removed components

## Testing
- [x] Run backend build to ensure no compilation errors
- [ ] Run frontend build to ensure no errors
- [ ] Test application functionality
