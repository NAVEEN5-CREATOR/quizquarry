import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import InstructorDashboard from './pages/InstructorDashboard';
import QuestionBankList from './pages/QuestionBankList';
import QuestionList from './pages/QuestionList';
import AiQuestionGenerator from './pages/AiQuestionGenerator';
import QuizList from './pages/QuizList';
import InstructorReports from './pages/InstructorReports';
import StudentDashboard from './pages/StudentDashboard';
import AvailableQuizzes from './pages/AvailableQuizzes';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';
import AnswerReview from './pages/AnswerReview';
import Leaderboard from './pages/Leaderboard';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, role, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !role) {
      dispatch(fetchCurrentUser());
    }
  }, [token, role, dispatch]);

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return role === 'INSTRUCTOR'
      ? <Navigate to="/instructor/dashboard" replace />
      : <Navigate to="/student/dashboard" replace />;
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main className="main-content">
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={getDefaultRedirect()} />

            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={isAuthenticated ? getDefaultRedirect() : <Login />}
            />
            <Route
              path="/register"
              element={isAuthenticated ? getDefaultRedirect() : <Register />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* Instructor Routes */}
            <Route element={<ProtectedRoute requiredRole="INSTRUCTOR" />}>
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/banks" element={<QuestionBankList />} />
              <Route path="/instructor/banks/:bankId/questions" element={<QuestionList />} />
              <Route path="/instructor/ai-generator" element={<AiQuestionGenerator />} />
              <Route path="/instructor/quizzes" element={<QuizList />} />
              <Route path="/instructor/reports" element={<InstructorReports />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute requiredRole="STUDENT" />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/quizzes" element={<AvailableQuizzes />} />
              <Route path="/student/quiz/:quizId/attempt/:attemptId" element={<QuizAttempt />} />
              <Route path="/student/attempt/:attemptId/result" element={<QuizResult />} />
              <Route path="/student/attempt/:attemptId/review" element={<AnswerReview />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={getDefaultRedirect()} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
