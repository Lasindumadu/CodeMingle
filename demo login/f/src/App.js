import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import FooterComponent from './components/FooterComponent';
import HeaderComponent from './components/HeaderComponent';
import ProtectedRoute from './components/ProtectedRoute';

// User Components
import ListUserComponent from './components/ListUserComponent';
import AddUserComponent from './components/AddUserComponent';
import DashboardComponent from './components/DashboardComponent';

// Course Components
import ListCourseComponent from './components/ListCourseComponent';
import AddCourseComponent from './components/AddCourseComponent';

// Lesson Components
import ListLessonComponent from './components/ListLessonComponent';
import AddLessonComponent from './components/AddLessonComponent';

// Enrollment Components
import ListEnrollmentComponent from './components/ListEnrollmentComponent';
import AddEnrollmentComponent from './components/AddEnrollmentComponent';

// Comment Components
import ListCommentComponent from './components/ListCommentComponent';
import AddCommentComponent from './components/AddCommentComponent';

// Quiz Components
import ListQuizComponent from './components/ListQuizComponent';
import AddQuizComponent from './components/AddQuizComponent';
import QuizTakingComponent from './components/QuizTakingComponent';

// Profile & Settings
import ProfileComponent from './components/ProfileComponent';
import SettingsComponent from './components/SettingsComponent';

// Auth Components
import LoginComponent from './components/LoginComponent';

// Quiz Attempt Components
// import ListQuizAttemptComponent from './components/ListQuizAttemptComponent';
// import AddQuizAttemptComponent from './components/AddQuizAttemptComponent';

// Lesson Progress Components
// import ListLessonProgressComponent from './components/ListLessonProgressComponent';
// import AddLessonProgressComponent from './components/AddLessonProgressComponent';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <HeaderComponent />
          <div className="container">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginComponent />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardComponent />
                  </ProtectedRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <ListUserComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-user"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddUserComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-user/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddUserComponent />
                  </ProtectedRoute>
                }
              />

              {/* Course Routes */}
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <ListCourseComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-course"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddCourseComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-course/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddCourseComponent />
                  </ProtectedRoute>
                }
              />

              {/* Lesson Routes */}
              <Route
                path="/lessons"
                element={
                  <ProtectedRoute>
                    <ListLessonComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-lesson"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddLessonComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-lesson/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddLessonComponent />
                  </ProtectedRoute>
                }
              />

              {/* Enrollment Routes */}
              <Route
                path="/enrollments"
                element={
                  <ProtectedRoute>
                    <ListEnrollmentComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-enrollment"
                element={
                  <ProtectedRoute>
                    <AddEnrollmentComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-enrollment/:id"
                element={
                  <ProtectedRoute>
                    <AddEnrollmentComponent />
                  </ProtectedRoute>
                }
              />

              {/* Comment Routes */}
              <Route
                path="/comments"
                element={
                  <ProtectedRoute>
                    <ListCommentComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-comment"
                element={
                  <ProtectedRoute>
                    <AddCommentComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-comment/:id"
                element={
                  <ProtectedRoute>
                    <AddCommentComponent />
                  </ProtectedRoute>
                }
              />

              {/* Quiz Routes */}
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <ListQuizComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-quiz"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddQuizComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-quiz/:id"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AddQuizComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/take-quiz/:id"
                element={
                  <ProtectedRoute>
                    <QuizTakingComponent />
                  </ProtectedRoute>
                }
              />

              {/* Profile & Settings */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileComponent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsComponent />
                  </ProtectedRoute>
                }
              />

              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />

              {/* Quiz Attempt Routes - Removed */}
              {/* Lesson Progress Routes - Removed */}
            </Routes>
          </div>
          <FooterComponent />
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
