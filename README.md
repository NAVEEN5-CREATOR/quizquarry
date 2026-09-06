# QUIZQUARRY — AI-Driven Question Bank & Online Assessment Platform

QUIZQUARRY is an intelligent question bank management and online quiz assessment engine. It equips educators and instructors with generative AI tools (powered by Google Gemini) to craft high-quality assessments, and delivers a timed quiz-taking experience for students with real-time scoring, analytics, and answer reviews.

---

## 🌟 Key Features

- **Gemini AI MCQ Studio**: Generate context-rich multiple-choice questions on any topic and difficulty level in seconds, complete with explanations.
- **Question Bank Architecture**: Organize questions by subject area, edit options, and curate pools for quizzes.
- **Assessment Engine**:
  - Max 3 attempts per student per quiz (`"Maximum 3 attempts allowed."`).
  - Allocation guard checking that questions exist before starting (`"Questions not allocated for this quiz yet."`).
  - Server-side duration validation & auto-submission.
  - Instant scoring with percentage calculation and answer explanations.
- **Interactive Dashboards**:
  - Instructor dashboard with bank stats, quiz manager, attempt reports, and student performance metrics.
  - Student dashboard with active assessments, remaining attempt counters, instant score reports, and answer breakdowns.
  - Global leaderboard ranking top achievers.
- **Security**: Stateless JWT authentication, BCrypt password hashing, role-based access control (`INSTRUCTOR` vs `STUDENT`), and Swagger OpenAPI documentation.

---

## 🏗️ Architecture

- **Backend**: Java 17+, Spring Boot 3.3.0, Spring Data JPA, Spring Security, JJWT, Maven, SpringDoc OpenAPI (Swagger).
- **Frontend**: React 18, Vite, Redux Toolkit, React Router v6, Axios, Lucide Icons, Glassmorphic CSS Design System.
- **Database**: MySQL 8.0 (with H2 in-memory option for zero-dependency test execution).

---

## 🚀 Getting Started

### 1. Prerequisites
- Java JDK 17 or higher (`java -version`)
- Apache Maven 3.8+ (`mvn -version`)
- Node.js 18+ & npm (`node -v`, `npm.cmd -v`)
- MySQL 8.0 (or utilize auto-configured test profile)

### 2. Environment Setup
Copy `.env.example` to `.env` or set environment variables:
```bash
# Windows PowerShell
$env:GEMINI_API_KEY="your-google-gemini-api-key"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
```

### 3. Database Setup (MySQL)
Run the script located at `database/quizquarry.sql`:
```bash
# In MySQL CLI or Workbench:
source database/quizquarry.sql;
```

### 4. Running Backend
```bash
cd backend
mvn spring-boot:run
```
Backend starts on `http://localhost:8080`.
Swagger UI is accessible at: `http://localhost:8080/swagger-ui/index.html`.

### 5. Running Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 🧪 Testing

```bash
# Backend test suite (JUnit 5 + Spring Boot Test)
cd backend
mvn test

# Frontend build check
cd frontend
npm run build
```
