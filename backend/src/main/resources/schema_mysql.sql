-- MySQL Compatible Schema for CodeMingle
-- This schema matches the entity mappings in the Java code

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_picture VARCHAR(255),
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Courses table - matches Course entity
CREATE TABLE IF NOT EXISTS courses (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    instructor VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'BEGINNER',
    duration_hours INT,
    max_enrollments INT,
    price DECIMAL(10,2) DEFAULT 0.00,
    is_published BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(255),
    video_url VARCHAR(255),
    tags JSON,
    prerequisites JSON,
    learning_objectives TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_courses_category (category),
    INDEX idx_courses_published (is_published)
);

-- Lessons table - matches Lesson entity
CREATE TABLE IF NOT EXISTS lessons (
    lesson_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(20) DEFAULT 'TEXT',
    content TEXT,
    video_url VARCHAR(255),
    duration_minutes INT,
    lesson_order INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    INDEX idx_lessons_course (course_id),
    INDEX idx_lessons_order (course_id, lesson_order)
);

-- Enrollments table - matches Enrollment entity
CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    lesson_id BIGINT,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_status VARCHAR(20) DEFAULT 'NOT_STARTED',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    certificate_url VARCHAR(255),
    grade VARCHAR(10),
    feedback TEXT,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE SET NULL,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    INDEX idx_enrollments_user (user_id),
    INDEX idx_enrollments_course (course_id)
);

-- Comments table - matches Comment entity
CREATE TABLE IF NOT EXISTS comments (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT,
    lesson_id BIGINT,
    parent_comment_id BIGINT,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    INDEX idx_comments_user (user_id),
    INDEX idx_comments_lesson (lesson_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_type VARCHAR(20) DEFAULT 'PRACTICE',
    time_limit_minutes INT,
    passing_score INT DEFAULT 70,
    max_attempts INT DEFAULT 3,
    is_randomized BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    INDEX idx_quizzes_lesson (lesson_id)
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'MULTIPLE_CHOICE',
    options JSON,
    correct_answer TEXT,
    explanation TEXT,
    points INT DEFAULT 1,
    question_order INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    INDEX idx_questions_quiz (quiz_id)
);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    score INT NOT NULL,
    max_score INT NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT,
    answers JSON,
    feedback TEXT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    INDEX idx_attempts_user (user_id),
    INDEX idx_attempts_quiz (quiz_id)
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    progress_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    enrollment_id BIGINT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    time_spent_seconds INT DEFAULT 0,
    score INT,
    attempts INT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (user_id, lesson_id),
    INDEX idx_progress_user (user_id),
    INDEX idx_progress_lesson (lesson_id)
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_events_user (user_id),
    INDEX idx_events_type (event_type)
);
