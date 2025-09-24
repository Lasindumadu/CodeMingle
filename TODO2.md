# TODO: Update Add Comment Form with Dropdowns

## Tasks
- [x] Update AddCommentComponent.js to use dropdown menus for user, course, and lesson selection showing names instead of ID inputs.
- [x] Fix backend CommentDTO to include userName, lessonTitle, courseId, courseTitle.
- [x] Update CommentController to return full CommentDTO with names.
- [x] Update ListCommentComponent to use flat fields instead of nested objects.

## Details
- Add imports for UserService, CourseService, LessonService.
- Add state for users, courses, lessons, courseId.
- Fetch users, courses, lessons in useEffect.
- Replace userId number input with select dropdown showing user names.
- Add courseId select dropdown showing course names.
- Replace lessonId number input with select dropdown showing lesson names, filtered by selected courseId.
- Update validation to include courseId.
- Update form submission and pre-population for update mode.
- Fixed backend to return joined data in CommentDTO.
- Updated frontend to display names correctly in list and detail views.
