import React, {useState, useEffect, useRef} from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LessonService from '../services/LessonService'
import CourseService from '../services/CourseService'
import './ListComponents.css'
import './ListLessonComponent.css'

const ListLessonComponent = () => {

    const [lessons, setLessons] = useState([])
    const [courses, setCourses] = useState([])
    const [selectedLessonId, setSelectedLessonId] = useState('')
    const [selectedLesson, setSelectedLesson] = useState(null)
    const [filteredLessons, setFilteredLessons] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedLessonCardId, setSelectedLessonCardId] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()
    const urlSearchTerm = searchParams.get('search') || ''
    const urlSelected = searchParams.get('selected') || ''
    const [sortField, setSortField] = useState('lessonId')
    const [sortOrder, setSortOrder] = useState('asc')
    const lessonDetailRef = useRef(null)

    useEffect(() => {
        getAllLessons();
        getAllCourses();
    }, [])



    useEffect(() => {
        if (selectedLessonId) {
            const lesson = lessons.find(l => l.lessonId == selectedLessonId)
            setSelectedLesson(lesson)
        } else if (urlSelected) {
            const lesson = lessons.find(l => l.lessonId == urlSelected)
            setSelectedLesson(lesson)
            setSelectedLessonId(urlSelected)
            setSelectedLessonCardId(urlSelected)
        } else {
            setSelectedLesson(null)
        }
    }, [selectedLessonId, lessons, urlSelected])

    useEffect(() => {
        if (urlSearchTerm && searchTerm === '') {
            setSearchTerm(urlSearchTerm)
        }
    }, [urlSearchTerm])

    useEffect(() => {
        const lowerSearch = (searchTerm || urlSearchTerm).toLowerCase();

        const filtered = lessons.filter(lesson => {
            const title = lesson.title ? lesson.title.toLowerCase() : '';
            const topic = lesson.topic ? lesson.topic.toLowerCase() : '';
            const content = lesson.content ? lesson.content.toLowerCase() : '';

            // Change here: match if title, topic, content, or lessonId starts with the search term
            return (
                title.includes(lowerSearch) ||
                topic.includes(lowerSearch) ||
                content.includes(lowerSearch) ||
                (lesson.lessonId && lesson.lessonId.toString().includes(lowerSearch))
            );
        });
        setFilteredLessons(sortLessons(filtered));
    }, [lessons, searchTerm, urlSearchTerm, sortField, sortOrder]);
    

    const getAllLessons = () => {
        LessonService.getAllLessons()
            .then((response) => {
                console.log('Response data:', response.data);

                let data = response.data;

                // ✅ handle if API returns an array
                if (Array.isArray(data)) {
                    setLessons(data);
                }
                // ✅ handle if API wraps lessons in an object
                else if (data.lessons && Array.isArray(data.lessons)) {
                    setLessons(data.lessons);
                }
                else {
                    console.error('Unexpected response format:', data);
                    setLessons([]);
                }
            })
            .catch((error) => {
                console.error("Error fetching lessons:", error);
                setLessons([]);
            });
    };

    const getAllCourses = () => {
        CourseService.getAllCourses()
            .then((response) => {
                setCourses(response.data);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
                setCourses([]);
            });
    };
    

    const deleteLesson = (lessonId) => {
       LessonService.deleteLesson(lessonId).then((response) =>{
        getAllLessons();
       }).catch(error =>{
           console.log(error);
       })
    }

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return 'No content available';
        const plain = content.replace(/<[^>]*>/g, '');
        return plain.length > maxLength ? plain.substring(0, maxLength) + '...' : plain;
    }

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        if (value === '') {
            setSearchParams({})
        } else {
            setSearchParams({search: value})
        }
        setVisibleCount(10) // Reset pagination on search
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    const sortLessons = (lessons) => {
        return [...lessons].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'lessonId':
                    aValue = a.lessonId;
                    bValue = b.lessonId;
                    break;
                case 'title':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'topic':
                    aValue = a.topic || '';
                    bValue = b.topic || '';
                    break;
                case 'courseTitle':
                    aValue = a.courseTitle || '';
                    bValue = b.courseTitle || '';
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const handleLessonSelect = (lessonId) => {
        setSelectedLessonId(lessonId)
        setSelectedLessonCardId(lessonId)
        
        // Scroll to lesson detail after a short delay to ensure it's rendered
        setTimeout(() => {
            if (lessonDetailRef.current) {
                lessonDetailRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                })
            }
        }, 100)
    }

    const lessonsByCourse = courses.reduce((acc, course) => {
        acc[course.courseId] = lessons.filter(lesson => lesson.courseId == course.courseId)
        return acc
    }, {})

    return (
        <div className="lesson-page-container">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <div className="sidebar bg-light p-3 sidebar-custom">
                            <h5 className="mb-3 text-success fw-bold"><i className="fas fa-compass me-2"></i>Course Navigator</h5>
                            {courses.map(course => (
                                <div key={course.courseId} className="mb-3 border rounded p-2 bg-white shadow-sm course-card">
                                    <h6 className="bg-success text-white p-2 rounded mb-2 fw-semibold">
                                        <i className="fas fa-book me-2"></i>{course.title}
                                    </h6>
                                    <ul className="list-group list-group-flush lesson-ul">
                                        {lessonsByCourse[course.courseId]?.map(lesson => (
                                            <li key={lesson.lessonId} className={`list-group-item border-0 p-1 lesson-li ${selectedLessonCardId == lesson.lessonId ? 'bg-warning bg-opacity-25 border-start border-warning border-3' : ''}`}>
                                                <button
                                                    className={`btn p-0 text-decoration-none w-100 text-start lesson-button ${selectedLessonCardId == lesson.lessonId ? 'text-warning fw-bold selected' : 'text-dark'}`}
                                                    onClick={() => handleLessonSelect(lesson.lessonId)}
                                                >
                                                    <i className="fas fa-chalkboard-teacher me-1"></i><span className="lesson-title">{lesson.title}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="list-header d-flex justify-content-between align-items-center mb-4">
                            <h2 className="list-title mb-0">Lessons</h2>
                            <Link to="/add-lesson" className="btn btn-success btn-lg add-button" title="Add a new lesson">
                                <i className="fas fa-plus me-2"></i>Add Lesson
                            </Link>
                        </div>

                        {lessons.length > 0 && (
                            <div className="search-container mb-4">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by title, topic, content, or ID..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                style={{paddingRight: '8rem'}}
                                />
                                <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                            </div>
                        )}

                        {lessons.length > 0 && (
                            <div className="sort-container mb-4 d-flex gap-3">
                                <div className="form-group" style={{width: '150px'}}>
                                    <label htmlFor="sortField" className="form-label">Sort by:</label>
                                    <select
                                        id="sortField"
                                        className="form-select"
                                        value={sortField}
                                        onChange={(e) => setSortField(e.target.value)}
                                    >
                                        <option value="lessonId">ID</option>
                                        <option value="title">Title</option>
                                        <option value="topic">Topic</option>
                                        <option value="courseTitle">Course</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{width: '120px'}}>
                                    <label htmlFor="sortOrder" className="form-label">Order:</label>
                                <select
                                    id="sortOrder"
                                    className="form-select"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="asc">A-Z</option>
                                    <option value="desc">Z-A</option>
                                </select>
                                </div>
                            </div>
                        )}

                        {selectedLesson && (
                            <div ref={lessonDetailRef} className="lesson-detail-card mb-4">
                                <div className="lesson-detail-header">
                                    <h3 className="lesson-detail-title">{selectedLesson.title}</h3>
                                    {selectedLesson.topic && (
                                        <div className="mt-1">
                                            <i className="fas fa-stream me-2"></i>{selectedLesson.topic}
                                        </div>
                                    )}
                                </div>
                                <div className="lesson-detail-body">
                                    <div className="lesson-meta">
                                        <span className="lesson-chip"><i className="fas fa-hashtag me-1"></i>ID: {selectedLesson.lessonId}</span>
                                        {selectedLesson.courseTitle && (
                                            <span className="lesson-chip"><i className="fas fa-book me-1"></i>{selectedLesson.courseTitle}</span>
                                        )}
                                    </div>
                                    {/* Mini Table of Contents */}
                                    {selectedLesson.content && (
                                        <div className="lesson-toc">
                                            <h6 className="mb-2"><i className="fas fa-list me-2"></i>Contents</h6>
                                            <ul>
                                                {(selectedLesson.content.match(/<h2[\s\S]*?>[\s\S]*?<\/h2>/gi) || []).map((h2, idx) => {
                                                    const text = h2.replace(/<[^>]*>/g, '').trim();
                                                    return <li key={idx}>{text}</li>
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="lesson-content-html">
                                        {selectedLesson.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }}></div>
                                        ) : (
                                            <p>No content available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {filteredLessons.length === 0 ? (
                            <div className="empty-state text-center py-5">
                                <i className="fas fa-chalkboard-teacher fa-3x text-muted mb-3"></i>
                                <h4 className="empty-title">{searchTerm ? 'No lessons match your search' : 'No lessons available'}</h4>
                                <p className="empty-text">{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first lesson!'}</p>
                            </div>
                        ) : (
                            <>
                                {/* Group lessons under course headers */}
                                {courses.map(course => {
                                    const lessonsForCourse = filteredLessons.filter(l => (l.courseId == course.courseId) || (l.courseTitle && l.courseTitle === course.title));
                                    if (lessonsForCourse.length === 0) return null;
                                    return (
                                        <div key={course.courseId} className="mb-4">
                                            <div className="course-header-container">
                                                <h4 className="course-header-title">
                                                    <i className="fas fa-book-open"></i>
                                                    {course.title}
                                                </h4>
                                            </div>
                                            <div className="list-card-container">
                                                {lessonsForCourse.slice(0, visibleCount).map(lesson => (
                                                    <div key={lesson.lessonId} className="list-card text-center" onClick={() => handleLessonSelect(lesson.lessonId)} style={{cursor: 'pointer'}}>
                                                        <i className="fas fa-graduation-cap card-icon fa-2x text-primary mb-3"></i>
                                                        <h5 className="card-title">{lesson.title}</h5>
                                                        {lesson.topic && (
                                                            <h6 className="card-subtitle mb-2 text-muted">{lesson.topic}</h6>
                                                        )}
                                                        <p className="mb-2">
                                                            {truncateContent(lesson.content)}
                                                        </p>
                                                        <div className="card-meta mt-auto">
                                                            ID: {lesson.lessonId}
                                                            <span className="course-badge"> • Course: {lesson.courseTitle || course.title}</span>
                                                        </div>
                                                        <div className="card-actions mt-3 d-flex gap-2">
                                                            <Link
                                                                className="btn btn-outline-primary btn-sm flex-fill"
                                                                to={`/edit-lesson/${lesson.lessonId}`}
                                                                title="Edit this lesson"
                                                            >
                                                                <i className="fas fa-edit me-1"></i>Edit
                                                            </Link>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm flex-fill"
                                                                onClick={() => {
                                                                    if (window.confirm('Are you sure you want to delete this lesson?')) {
                                                                        deleteLesson(lesson.lessonId);
                                                                    }
                                                                }}
                                                                title="Delete this lesson"
                                                            >
                                                                <i className="fas fa-trash me-1"></i>Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredLessons.length > visibleCount && (
                                    <div className="text-center mt-4">
                                        <button className="btn btn-secondary" onClick={loadMore}>
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListLessonComponent;
