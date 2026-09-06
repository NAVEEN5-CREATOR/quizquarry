-- =========================================================
-- QUIZQUARRY Database Schema & Seed Data
-- =========================================================

CREATE DATABASE IF NOT EXISTS quizquarry
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quizquarry;

-- 1. System Users
CREATE TABLE IF NOT EXISTS system_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Question Banks
CREATE TABLE IF NOT EXISTS question_banks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subject_area VARCHAR(100) NOT NULL,
    instructor_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES system_users(id) ON DELETE CASCADE,
    INDEX idx_bank_instructor (instructor_id)
) ENGINE=InnoDB;

-- 3. Bank Questions
CREATE TABLE IF NOT EXISTS bank_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_bank_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    is_ai_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
    INDEX idx_question_bank (question_bank_id)
) ENGINE=InnoDB;

-- 4. Quiz Assessments
CREATE TABLE IF NOT EXISTS quiz_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_bank_id BIGINT NOT NULL,
    instructor_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 15,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_bank_id) REFERENCES question_banks(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES system_users(id) ON DELETE CASCADE,
    INDEX idx_quiz_instructor (instructor_id),
    INDEX idx_quiz_bank (question_bank_id)
) ENGINE=InnoDB;

-- 5. Student Attempts
CREATE TABLE IF NOT EXISTS student_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_assessment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    score DECIMAL(5,2) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (quiz_assessment_id) REFERENCES quiz_assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES system_users(id) ON DELETE CASCADE,
    INDEX idx_attempt_quiz_student (quiz_assessment_id, student_id)
) ENGINE=InnoDB;

-- 6. Attempt Answers
CREATE TABLE IF NOT EXISTS attempt_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_attempt_id BIGINT NOT NULL,
    bank_question_id BIGINT NOT NULL,
    selected_option VARCHAR(255) NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_attempt_id) REFERENCES student_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_question_id) REFERENCES bank_questions(id) ON DELETE CASCADE,
    INDEX idx_answer_attempt (student_attempt_id)
) ENGINE=InnoDB;

-- =========================================================
-- SEED DATA (Password for seeded users is: Password123!)
-- BCrypt: $2a$10$7Z2v6nC6U91eJvjV8iIduuk95QeNlQhZ4jP0xWv2F1mB7T5fJ3Siy
-- =========================================================

-- Insert Seed Users if not exists
INSERT IGNORE INTO system_users (id, full_name, email, password_hash, role) VALUES
(1, 'Professor Jane Doe', 'instructor@quizquarry.com', '$2a$10$wE99KkZ0fS4bspk0U5gSVO5YV2cslm7eY1wT8KzV4u4N6hC1U8w5G', 'INSTRUCTOR'),
(2, 'Alex Johnson', 'student@quizquarry.com', '$2a$10$wE99KkZ0fS4bspk0U5gSVO5YV2cslm7eY1wT8KzV4u4N6hC1U8w5G', 'STUDENT');

-- Insert Seed Question Bank
INSERT IGNORE INTO question_banks (id, title, subject_area, instructor_id) VALUES
(1, 'Core Java & Distributed Systems', 'Computer Science', 1);

-- Insert Seed Bank Questions
INSERT IGNORE INTO bank_questions (id, question_bank_id, question_text, options_json, correct_answer, explanation, difficulty_level, is_ai_generated) VALUES
(1, 1, 'Which collection class in Java allows null elements and is not synchronized?', '["Vector", "Hashtable", "ArrayList", "ConcurrentHashMap"]', 'ArrayList', 'ArrayList is unsynchronized and allows storing null values unlike Hashtable and ConcurrentHashMap.', 'EASY', FALSE),
(2, 1, 'What is the primary benefit of using CompletableFuture in Java?', '["Automatic memory deallocation", "Asynchronous non-blocking computation", "Eliminating checked exceptions", "Synchronous thread locking"]', 'Asynchronous non-blocking computation', 'CompletableFuture enables composable, non-blocking asynchronous programming introduced in Java 8.', 'MEDIUM', FALSE),
(3, 1, 'In the CAP theorem, what does "P" stand for?', '["Processing power", "Protocol safety", "Partition tolerance", "Periodic sync"]', 'Partition tolerance', 'Partition tolerance indicates that the system continues to operate despite an arbitrary number of messages being dropped or delayed by the network.', 'EASY', FALSE),
(4, 1, 'Which garbage collector was introduced in modern OpenJDK designed for ultra-low latency with terabyte heaps?', '["Serial GC", "ZGC", "Parallel Old GC", "Mark-Sweep GC"]', 'ZGC', 'ZGC (Z Garbage Collector) is a scalable low-latency garbage collector capable of handling heaps up to 16TB with sub-millisecond pauses.', 'HARD', FALSE);

-- Insert Seed Quiz Assessment
INSERT IGNORE INTO quiz_assessments (id, question_bank_id, instructor_id, title, time_limit_minutes, status) VALUES
(1, 1, 1, 'Java & Distributed Systems Mastery Assessment', 10, 'PUBLISHED');
