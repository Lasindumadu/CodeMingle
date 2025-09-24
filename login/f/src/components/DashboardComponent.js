import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './DashboardComponent.css'
import UserService from '../services/UserService'
import CourseService from '../services/CourseService'
import LessonService from '../services/LessonService'
import EnrollmentService from '../services/EnrollmentService'
import CommentService from '../services/CommentService'
import QuizService from '../services/QuizService'

const DashboardComponent = () => {
    // State for dashboard statistics
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        lessons: 0
    })

    // State for dashboard cards data
    const [cardsData, setCardsData] = useState({
        users: { count: 0, progress: 0 },
        courses: { count: 0, progress: 0 },
        lessons: { count: 0, progress: 0 },
        enrollments: { count: 0, progress: 0 },
        comments: { count: 0, progress: 0 },
        quizzes: { count: 0, progress: 0 }
    })

    // State for loading
    const [loading, setLoading] = useState(true)

    // Function to fetch all dashboard data
    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            
            // Fetch all data in parallel
            const [
                usersResponse,
                coursesResponse,
                lessonsResponse,
                enrollmentsResponse,
                commentsResponse,
                quizzesResponse
            ] = await Promise.all([
                UserService.getAllUsers(),
                CourseService.getAllCourses(),
                LessonService.getAllLessons(),
                EnrollmentService.getAllEnrollments(),
                CommentService.getAllComments(),
                QuizService.getAllQuizzes()
            ])

            // Update statistics
            setStats({
                students: usersResponse.data?.length || 0,
                courses: coursesResponse.data?.length || 0,
                lessons: lessonsResponse.data?.length || 0
            })

            // Calculate meaningful percentages based on business logic
            const totalUsers = usersResponse.data?.length || 0
            const totalCourses = coursesResponse.data?.length || 0
            const totalLessons = lessonsResponse.data?.length || 0
            const totalEnrollments = enrollmentsResponse.data?.length || 0
            const totalComments = commentsResponse.data?.length || 0
            const totalQuizzes = quizzesResponse.data?.length || 0

            // Calculate completion rates and engagement metrics
            const courseCompletionRate = totalCourses > 0 ? Math.min(100, Math.round((totalLessons / (totalCourses * 5)) * 100)) : 0
            const enrollmentRate = totalUsers > 0 ? Math.min(100, Math.round((totalEnrollments / (totalUsers * 2)) * 100)) : 0
            const engagementRate = totalUsers > 0 ? Math.min(100, Math.round((totalComments / (totalUsers * 3)) * 100)) : 0
            const quizCompletionRate = totalCourses > 0 ? Math.min(100, Math.round((totalQuizzes / (totalCourses * 2)) * 100)) : 0

            setCardsData({
                users: { 
                    count: totalUsers, 
                    progress: totalUsers > 0 ? Math.min(100, Math.round((totalUsers / 100) * 100)) : 0
                },
                courses: { 
                    count: totalCourses, 
                    progress: courseCompletionRate
                },
                lessons: { 
                    count: totalLessons, 
                    progress: totalCourses > 0 ? Math.min(100, Math.round((totalLessons / (totalCourses * 10)) * 100)) : 0
                },
                enrollments: { 
                    count: totalEnrollments, 
                    progress: enrollmentRate
                },
                comments: { 
                    count: totalComments, 
                    progress: engagementRate
                },
                quizzes: { 
                    count: totalQuizzes, 
                    progress: quizCompletionRate
                }
            })

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Set default values on error
            setStats({ students: 0, courses: 0, lessons: 0 })
            setCardsData({
                users: { count: 0, progress: 0 },
                courses: { count: 0, progress: 0 },
                lessons: { count: 0, progress: 0 },
                enrollments: { count: 0, progress: 0 },
                comments: { count: 0, progress: 0 },
                quizzes: { count: 0, progress: 0 }
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Initial data fetch
        fetchDashboardData()

        // Set up automatic refresh every 30 seconds
        const interval = setInterval(fetchDashboardData, 30000)

        // Cleanup interval on component unmount
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const cards = document.querySelectorAll('.dashboard-card')
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1'
                card.style.transform = 'translateY(0)'
            }, 100 + index * 150) // Staggered animation
        })
    }, [cardsData]) // Re-trigger animation when data updates

    const dashboardItems = [
        {
            path: '/users',
            icon: '👥',
            title: 'Users',
            description: 'Manage platform users and their accounts.',
            stats: 'Platform Growth',
            count: cardsData.users.count,
            progress: cardsData.users.progress,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            buttonText: 'View Users'
        },
        {
            path: '/courses',
            icon: '📚',
            title: 'Courses',
            description: 'Create and manage engaging coding courses.',
            stats: 'Content Completion',
            count: cardsData.courses.count,
            progress: cardsData.courses.progress,
            gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            buttonText: 'View Courses'
        },
        {
            path: '/lessons',
            icon: '📖',
            title: 'Lessons',
            description: 'Organize course lessons and content modules.',
            stats: 'Lesson Density',
            count: cardsData.lessons.count,
            progress: cardsData.lessons.progress,
            gradient: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
            buttonText: 'View Lessons'
        },
        {
            path: '/enrollments',
            icon: '🎓',
            title: 'Enrollments',
            description: 'Track student progress and course enrollments.',
            stats: 'Student Engagement',
            count: cardsData.enrollments.count,
            progress: cardsData.enrollments.progress,
            gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
            buttonText: 'View Enrollments'
        },
        {
            path: '/comments',
            icon: '💬',
            title: 'Comments',
            description: 'Moderate user comments and community feedback.',
            stats: 'Community Activity',
            count: cardsData.comments.count,
            progress: cardsData.comments.progress,
            gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
            buttonText: 'View Comments'
        },
        {
            path: '/quizzes',
            icon: '🧠',
            title: 'Quizzes',
            description: 'Create and manage interactive assessment quizzes.',
            stats: 'Assessment Coverage',
            count: cardsData.quizzes.count,
            progress: cardsData.quizzes.progress,
            gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            buttonText: 'View Quizzes'
        }
    ]

    return (
        <div className="dashboard-container">
            <div className="container">

                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="text-center mb-4">
                        <h1 className="dashboard-title">
                            Welcome to <span>CodeMingle</span>
                        </h1>
                        <p className="dashboard-subtitle">
                            Your central hub for managing interactive learning, hands-on projects, and student certifications.
                            {loading && <span className="ms-2 text-muted">(Updating...)</span>}
                        </p>
                    </div>
                    
                    <div className="d-flex justify-content-center mb-4">
                        <button 
                            className="btn btn-outline-primary btn-sm refresh-btn"
                            onClick={fetchDashboardData}
                            disabled={loading}
                            title="Refresh Data"
                        >
                            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
                            <span className="ms-2">Refresh Data</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="dashboard-stats">
                        <div className="stat-item">
                            <h2 className="stat-number">
                                {loading ? '...' : `${stats.students}+`}
                            </h2>
                            <p className="stat-label">Students</p>
                        </div>
                        <div className="stat-item">
                            <h2 className="stat-number">
                                {loading ? '...' : `${stats.courses}+`}
                            </h2>
                            <p className="stat-label">Courses</p>
                        </div>
                        <div className="stat-item">
                            <h2 className="stat-number">
                                {loading ? '...' : `${stats.lessons}+`}
                            </h2>
                            <p className="stat-label">Lessons</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="row g-4 dashboard-cards-grid">
                    {dashboardItems.map((item) => (
                        <div key={item.path} className="col-lg-4 col-md-6">
                            <div className="dashboard-card">
                                <div className="card-content">
                                    <div
                                        className="card-icon"
                                        style={{ background: item.gradient }}
                                    >
                                        {item.icon}
                                    </div>

                                    <h5 className="card-title">{item.title}</h5>
                                    <p className="card-description">{item.description}</p>

                                    <div className="progress-container">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small className="progress-label">
                                                {item.stats} ({loading ? '...' : item.count})
                                            </small>
                                            <small className="progress-label">
                                                {loading ? '...' : `${item.progress}%`}
                                            </small>
                                        </div>
                                        <div className="progress">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${loading ? 0 : item.progress}%`,
                                                    background: item.gradient,
                                                    transition: 'width 0.8s ease-in-out'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <Link
                                        to={item.path}
                                        className="card-button"
                                        style={{ '--gradient': item.gradient }}
                                    >
                                        {item.buttonText}
                                        <i className="fas fa-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action Section */}
                <div className="cta-section">
                    <div className="cta-card">
                        <h3 className="cta-title">🚀 Ready to Start Learning?</h3>
                        <p className="cta-text">Join thousands of students building their coding journey with <strong>CodeMingle</strong>.</p>
                        <div className="cta-buttons">
                            <Link to="/courses" className="cta-button-primary">
                                Explore Courses
                            </Link>
                            <Link to="/add-user" className="cta-button-secondary">
                                Join Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardComponent