-- Demo users for CodeMingle application
-- Password for all users is 'password' (hashed with BCrypt)

-- Insert demo admin (ID = 1)
INSERT IGNORE INTO users (user_id, username, email, password, role, created_at) VALUES
(1, 'admin', 'admin@codemingle.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', NOW());

-- Insert demo user (ID = 2)
INSERT IGNORE INTO users (user_id, username, email, password, role, created_at) VALUES
(2, 'user', 'user@codemingle.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', NOW());

-- Insert additional demo users
INSERT IGNORE INTO users (user_id, username, email, password, role, created_at) VALUES
(3, 'instructor1', 'instructor@codemingle.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INSTRUCTOR', NOW());

INSERT IGNORE INTO users (user_id, username, email, password, role, created_at) VALUES
(4, 'student1', 'student1@codemingle.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', NOW());

INSERT IGNORE INTO users (user_id, username, email, password, role, created_at) VALUES
(5, 'student2', 'student2@codemingle.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER', NOW());

-- Insert sample courses
INSERT IGNORE INTO courses (course_id, title, description, category, created_at) VALUES
(1, 'Introduction to Java Programming', 'Learn the basics of Java programming language', 'Programming', NOW());

INSERT IGNORE INTO courses (course_id, title, description, category, created_at) VALUES
(2, 'Advanced Spring Boot', 'Master Spring Boot framework for enterprise applications', 'Programming', NOW());

INSERT IGNORE INTO courses (course_id, title, description, category, created_at) VALUES
(3, 'Database Design Fundamentals', 'Learn how to design efficient database schemas', 'Database', NOW());

-- Insert sample lessons
INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(1, 1, 'Java Basics', 'Java is a high-level programming language...', 'Introduction', NOW());

INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(2, 1, 'Variables and Data Types', 'In Java, variables are containers for storing data...', 'Fundamentals', NOW());

INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(3, 1, 'Control Structures', 'Control structures allow you to control the flow of execution...', 'Logic', NOW());

INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(4, 2, 'Spring Boot Introduction', 'Spring Boot makes it easy to create stand-alone applications...', 'Framework', NOW());

INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(5, 2, 'Auto Configuration', 'Auto-configuration attempts to automatically configure your Spring application...', 'Configuration', NOW());

INSERT IGNORE INTO lessons (lesson_id, course_id, title, content, topic, created_at) VALUES
(6, 3, 'Database Concepts', 'A database is an organized collection of structured information...', 'Theory', NOW());

-- Insert sample enrollments
INSERT IGNORE INTO enrollments (enrollment_id, user_id, course_id, enrollment_date) VALUES
(1, 2, 1, NOW());

INSERT IGNORE INTO enrollments (enrollment_id, user_id, course_id, enrollment_date) VALUES
(2, 4, 1, NOW());

INSERT IGNORE INTO enrollments (enrollment_id, user_id, course_id, enrollment_date) VALUES
(3, 4, 2, NOW());

INSERT IGNORE INTO enrollments (enrollment_id, user_id, course_id, enrollment_date) VALUES
(4, 5, 3, NOW());

-- Insert sample quizzes
INSERT IGNORE INTO quizzes (quiz_id, lesson_id, title, description, time_limit_minutes, shuffle_questions, created_at) VALUES
(1, 1, 'Java Basics Quiz', 'Test your knowledge of Java basics', 30, FALSE, NOW());

INSERT IGNORE INTO quizzes (quiz_id, lesson_id, title, description, time_limit_minutes, shuffle_questions, created_at) VALUES
(2, 4, 'Spring Boot Quiz', 'Test your understanding of Spring Boot', 45, FALSE, NOW());

-- Insert sample quiz questions
INSERT IGNORE INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
(1, 1, 'What is Java?', 'A programming language', 'A coffee brand', 'An island', 'A framework', 'A', 1);

INSERT IGNORE INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
(2, 1, 'Java is platform independent. True or False?', 'True', 'False', 'Sometimes', 'Never', 'A', 2);

INSERT IGNORE INTO questions (question_id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_order) VALUES
(3, 2, 'What does Spring Boot provide?', 'Auto-configuration', 'Embedded servers', 'Production-ready features', 'All of the above', 'D', 1);

-- Insert sample comments
INSERT IGNORE INTO comments (comment_id, user_id, lesson_id, content, created_at) VALUES
(1, 2, 1, 'Great introduction to Java! Very clear explanations.', NOW());

INSERT IGNORE INTO comments (comment_id, user_id, lesson_id, content, created_at) VALUES
(2, 4, 2, 'The examples helped me understand variables better.', NOW());

INSERT IGNORE INTO comments (comment_id, user_id, lesson_id, content, created_at) VALUES
(3, 5, 4, 'Looking forward to learning more about Spring Boot.', NOW());