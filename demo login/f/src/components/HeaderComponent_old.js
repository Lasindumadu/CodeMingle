import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import UserService from '../services/UserService'
import CourseService from '../services/CourseService'
import LessonService from '../services/LessonService'
import EnrollmentService from '../services/EnrollmentService'
import QuizService from '../services/QuizService'
import CommentService from '../services/CommentService'
import AuthService from '../services/AuthService'
import './HeaderComponent.css'

const HeaderComponent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const { isAuthenticated, isAdmin, user, logout } = useContext(AuthContext)

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const handleLogout = () => {
    AuthService.logout()
    logout()
    navigate('/login')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim() === '') {
      setIsSearchDropdownOpen(false)
      setSearchResults([])
    } else {
      setIsSearchDropdownOpen(true)
      performSearch(value)
    }
  }

  const performSearch = async (term) => {
    const lowerTerm = term.toLowerCase()
    const results = []

    try {
      // Fetch all data
      const [usersRes, coursesRes, lessonsRes, enrollmentsRes, quizzesRes, commentsRes] = await Promise.all([
        UserService.getAllUsers(),
        CourseService.getAllCourses(),
        LessonService.getAllLessons(),
        EnrollmentService.getAllEnrollments(),
        QuizService.getAllQuizzes(),
        CommentService.getAllComments()
      ])

      // Parse data
      const parseData = (data) => {
        if (typeof data === 'string') {
          try {
            return JSON.parse(data)
          } catch {
            return []
          }
        }
        return Array.isArray(data) ? data : []
      }

      const users = parseData(usersRes.data)
      const courses = parseData(coursesRes.data)
      const lessons = parseData(lessonsRes.data)
      const enrollments = parseData(enrollmentsRes.data)
      const quizzes = parseData(quizzesRes.data)
      const comments = parseData(commentsRes.data)

      // Filter and add to results
      users.forEach(user => {
        if ((user.username && user.username.toLowerCase().includes(lowerTerm)) ||
            (user.email && user.email.toLowerCase().includes(lowerTerm)) ||
            (user.userId && user.userId.toString().includes(lowerTerm))) {
          results.push({
            type: 'User',
            id: user.userId,
            name: user.username || 'Unknown User',
            path: `/users?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-user'
          })
        }
      })

      courses.forEach(course => {
        if ((course.title && course.title.toLowerCase().includes(lowerTerm)) ||
            (course.courseId && course.courseId.toString().includes(lowerTerm))) {
          results.push({
            type: 'Course',
            id: course.courseId,
            name: course.title || 'Untitled Course',
            path: `/courses?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-book'
          })
        }
      })

      lessons.forEach(lesson => {
        if ((lesson.title && lesson.title.toLowerCase().includes(lowerTerm)) ||
           (lesson.lessonId && lesson.lessonId.toString().includes(lowerTerm))) {
          results.push({
            type: 'Lesson',
            id: lesson.lessonId,
            name: lesson.title || 'Untitled Lesson',
            path: `/lessons?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-chalkboard-teacher'
          })
        }
      })

      enrollments.forEach(enrollment => {
        if ((enrollment.userName && enrollment.userName.toLowerCase().includes(lowerTerm)) ||
            (enrollment.courseName && enrollment.courseName.toLowerCase().includes(lowerTerm)) ||
            (enrollment.enrollmentId && enrollment.enrollmentId.toString().includes(lowerTerm))) {
          results.push({
            type: 'Enrollment',
            id: enrollment.enrollmentId,
            name: `${enrollment.userName || 'User'} - ${enrollment.courseName || 'Course'}`,
            path: `/enrollments?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-user-graduate'
          })
        }
      })

      quizzes.forEach(quiz => {
        if ((quiz.title && quiz.title.toLowerCase().includes(lowerTerm)) ||
            (quiz.quizId && quiz.quizId.toString().includes(lowerTerm))) {
          results.push({
            type: 'Quiz',
            id: quiz.quizId,
            name: quiz.title || 'Untitled Quiz',
            path: `/quizzes?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-brain'
          })
        }
      })

      comments.forEach(comment => {
        if (comment.content && comment.content.toLowerCase().includes(lowerTerm)) {
          results.push({
            type: 'Comment',
            id: comment.commentId,
            name: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
            path: `/comments?search=${encodeURIComponent(term)}`,
            icon: 'fas fa-comment'
          })
        }
      })

      setSearchResults(results.slice(0, 10)) // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    }
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false)
    }
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsSearchDropdownOpen(false)
      setIsSearchExpanded(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  // Animate gradient divider on route change
  useEffect(() => {
    document.body.classList.add('route-change')
    const timeout = setTimeout(() => {
      document.body.classList.remove('route-change')
    }, 700)
    return () => clearTimeout(timeout)
  }, [location.pathname])

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: 'Dashboard' },
    { path: '/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/courses', icon: 'fas fa-book', label: 'Courses' },
    { path: '/lessons', icon: 'fas fa-chalkboard-teacher', label: 'Lessons' },
    { path: '/enrollments', icon: 'fas fa-user-graduate', label: 'Enrollments' },
    { path: '/comments', icon: 'fas fa-comments', label: 'Comments' },
    { path: '/quizzes', icon: 'fas fa-brain', label: 'Quizzes' }
  ]

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Brand */}
        <Link to="/" className="header-brand">
          <div className="brand-icon" aria-label="CodeMingle Logo">🎓</div>
          <div>
            <h1 className="brand-text">CodeMingle</h1>
            <small className="brand-subtitle">Learn • Code • Grow</small>
          </div>
        </Link>

        {/* Search Bar */}
        <div className={`header-search ${isSearchExpanded ? 'expanded' : ''}`} ref={searchRef}>
          <button
            type="button"
            className="search-toggle"
            aria-label={isSearchExpanded ? 'Collapse search' : 'Expand search'}
            onClick={() => {
              setIsSearchExpanded((prev) => {
                const next = !prev
                if (!next) {
                  setIsSearchDropdownOpen(false)
                }
                return next
              })
              setTimeout(() => {
                if (searchInputRef.current) {
                  searchInputRef.current.focus()
                  if (searchTerm.trim() !== '') {
                    setIsSearchDropdownOpen(true)
                    performSearch(searchTerm)
                  }
                }
              }, 0)
            }}
          >
            <i className="fas fa-search" aria-hidden="true"></i>
          </button>
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search courses, users, quizzes..."
            value={searchTerm}
            onFocus={() => {
              setIsSearchExpanded(true)
              if (searchTerm.trim() !== '') {
                setIsSearchDropdownOpen(true)
                performSearch(searchTerm)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchDropdownOpen(false)
                setIsSearchExpanded(false)
                e.currentTarget.blur()
              }
              if (e.key === 'Enter') {
                setIsSearchDropdownOpen(false)
              }
            }}
            onChange={handleSearchChange}
            aria-label="Search"
          />
          {isSearchDropdownOpen && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.path}
                  className="search-result-item"
                  onClick={() => {
                    setIsSearchDropdownOpen(false)
                    setSearchTerm('')
                  }}
                >
                  <i className={`${result.icon} result-icon`} aria-hidden="true"></i>
                  <div className="result-content">
                    <div className="result-name">{result.name}</div>
                    <div className="result-type">{result.type}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="nav-icon-wrap">
                    <i className={`${item.icon} nav-icon`} aria-hidden="true"></i>
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="user-profile" ref={dropdownRef}>
          <button
            className="profile-button"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            <div className="profile-avatar" aria-hidden="true">U</div>
          </button>
          <div className={`profile-dropdown ${dropdownOpen ? 'show' : ''}`}>
            <Link to="/profile" className="dropdown-item">Profile</Link>
            <Link to="/settings" className="dropdown-item">Settings</Link>
            <div className="dropdown-divider"></div>
            <Link to="/logout" className="dropdown-item">Logout</Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${isOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <i className={`${item.icon} nav-icon`} aria-hidden="true"></i>
                {item.label}
              </Link>
            </li>
          ))}
            <li>
              <Link to="/profile" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
                <span className="nav-icon-wrap">
                  <i className="fas fa-user nav-icon" aria-hidden="true"></i>
                </span>
                Profile
              </Link>
            </li>
          <li>
            <Link to="/settings" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
              <span className="nav-icon-wrap">
                <i className="fas fa-cog nav-icon" aria-hidden="true"></i>
              </span>
              Settings
            </Link>
          </li>
          <li>
            <Link to="/logout" className="mobile-nav-link" onClick={() => setIsOpen(false)}>
              <span className="nav-icon-wrap">
                <i className="fas fa-sign-out-alt nav-icon" aria-hidden="true"></i>
              </span>
              Logout
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default HeaderComponent
