DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS students;

-- 1. Students Table
CREATE TABLE students (
    id TEXT PRIMARY KEY,           -- e.g., 'BIO-442'
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,   -- Hashed password
    grade_id TEXT NOT NULL,        -- 'Grade 9', 'Grade 10', 'Grade 11'
    group_name TEXT NOT NULL,      -- 'Alpha Lab Group'
    avatar_initials TEXT NOT NULL  -- 'MK'
);

-- 2. Sessions / Topics Table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,           -- e.g., 'session-6'
    grade_id TEXT NOT NULL,
    title TEXT NOT NULL,
    unit_info TEXT NOT NULL,
    date TEXT NOT NULL,
    video_url TEXT
);

-- 3. Attendance Table (Tied to specific sessions to prevent duplicate scans)
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    status TEXT NOT NULL,          -- 'Present', 'Absent'
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(session_id) REFERENCES sessions(id)
);

-- 4. Homework Submissions Table
CREATE TABLE assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    status TEXT NOT NULL,          -- 'Submitted', 'Pending', 'Corrected'
    file_url TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

-- 5. Quizzes & Mark Schemes Table
CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    session_id TEXT NOT NULL,
    score INTEGER,
    max_score INTEGER,
    is_released INTEGER DEFAULT 0, -- 0 = locked, 1 = unlocked
    pdf_url TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

-- Seed initial test student (Malak Khaled)
INSERT INTO students (id, name, phone, password_hash, grade_id, group_name, avatar_initials)
VALUES ('BIO-442', 'Malak Khaled', '00201012345678', 'bio12345', 'Grade 11', 'Alpha Lab Group', 'MK');

-- Seed initial test session
INSERT INTO sessions (id, grade_id, title, unit_info, date, video_url)
VALUES ('session-6', 'Grade 11', 'Session 6: Nervous System & Synapses', 'Date: Oct 28 • Unit 4', '2026-10-28', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');