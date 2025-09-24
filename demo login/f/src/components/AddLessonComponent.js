import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import LessonService from '../services/LessonService'
import CourseService from '../services/CourseService'
import { Editor } from '@tinymce/tinymce-react'

const AddLessonComponent = () => {
    const editorRef = useRef(null)
    const [courseId, setCourseId] = useState('')
    const [topic, setTopic] = useState('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [courses, setCourses] = useState([])
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        // Fetch all courses for dropdown
        CourseService.getAllCourses()
            .then((response) => {
                setCourses(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    const validateForm = () => {
        const newErrors = {}
        if (!courseId) {
            newErrors.courseId = 'Please select a course'
        }
        if (!topic.trim()) {
            newErrors.topic = 'Lesson topic is required'
        } else if (topic.length < 3) {
            newErrors.topic = 'Topic must be at least 3 characters'
        }
        if (!title.trim()) {
            newErrors.title = 'Lesson title is required'
        } else if (title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters'
        }
        // Strip HTML tags to check plain text length
        const plainText = (content || '').replace(/<[^>]*>/g, '').trim()
        if (!plainText) {
            newErrors.content = 'Lesson content is required'
        } else if (plainText.length < 10) {
            newErrors.content = 'Content must be at least 10 characters'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const saveOrUpdateLesson = (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsSubmitting(true)
        const lesson = id
            ? { courseId: parseInt(courseId), topic: topic.trim(), title: title.trim(), content: content.trim() }
            : { course: { courseId: parseInt(courseId) }, topic: topic.trim(), title: title.trim(), content: content.trim() }

        const promise = id ? LessonService.updateLesson(id, lesson) : LessonService.createLesson(lesson)

        promise
            .then((response) => {
                console.log(response.data)
                navigate('/lessons')
            })
            .catch((error) => {
                console.log(error)
                setErrors({ submit: 'Failed to save lesson. Please try again.' })
            })
            .finally(() => {
                setIsSubmitting(false)
            })
    }

    useEffect(() => {
        if (id) {
            LessonService.getLessonById(id)
                .then((response) => {
                    setCourseId(
                        response.data.course?.courseId?.toString() ||
                        response.data.courseId?.toString() ||
                        ''
                    )
                    setTopic(response.data.topic || '')
                    setTitle(response.data.title)
                    setContent(response.data.content)
                })
                .catch((error) => {
                    console.log(error)
                    setErrors({ load: 'Failed to load lesson data' })
                })
        }
    }, [id])

    const titleText = () => {
        if (id) {
            return <><i className="fas fa-book me-2"></i>Update Lesson</>
        } else {
            return <span style={{color: 'white'}}><i className="fas fa-book-open me-2"></i>Add New Lesson</span>
        }
    }

    return (
        <div className="user-form-container">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-10">
                        <div className="user-form-card">
                            <div className="user-form-header">
                                <div className="user-form-avatar">
                                    <i className="fas fa-book"></i>
                                </div>
                                <h1 className="user-form-title">
                                    {titleText()}
                                </h1>
                            </div>

                            <div className="user-form-body">
                                {errors.load && (
                                    <div className="alert alert-danger user-form-alert">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errors.load}
                                    </div>
                                )}

                                <form onSubmit={saveOrUpdateLesson} className="user-form">
                                    <div className="form-section">
                                        <div className="form-field-group">
                                            <div className="form-field">
                                                <label htmlFor="courseId" className="form-field-label">
                                                    Select Course
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-select-wrapper">
                                                    <select
                                                        id="courseId"
                                                        name="courseId"
                                                        className={`form-field-select ${errors.courseId ? 'is-invalid' : ''}`}
                                                        value={courseId}
                                                        onChange={(e) => setCourseId(e.target.value)}
                                                        disabled={isSubmitting}
                                                    >
                                                        <option value="">Choose a course...</option>
                                                        {courses.map((course) => (
                                                            <option key={course.courseId} value={course.courseId}>
                                                                {course.title} {course.category && `(${course.category})`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.courseId && (
                                                    <div className="form-field-error">{errors.courseId}</div>
                                                )}
                                            </div>

                                            <div className="form-field">
                                                <label htmlFor="topic" className="form-field-label">
                                                    Lesson Topic
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <input
                                                        type="text"
                                                        id="topic"
                                                        placeholder="Enter the main topic of this lesson"
                                                        name="topic"
                                                        className={`form-field-input ${errors.topic ? 'is-invalid' : ''}`}
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.topic && (
                                                    <div className="form-field-error">{errors.topic}</div>
                                                )}
                                            </div>

                                            <div className="form-field">
                                                <label htmlFor="title" className="form-field-label">
                                                    Lesson Title
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <input
                                                        type="text"
                                                        id="title"
                                                        placeholder="Enter an engaging lesson title"
                                                        name="title"
                                                        className={`form-field-input ${errors.title ? 'is-invalid' : ''}`}
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.title && (
                                                    <div className="form-field-error">{errors.title}</div>
                                                )}
                                            </div>

                                            <div className="form-field">
                                                <label htmlFor="content" className="form-field-label">
                                                    Lesson Content
                                                    <span className="required-asterisk">*</span>
                                                </label>
                                                <div className="form-field-input-wrapper">
                                                    <div className="mb-2 d-flex flex-wrap gap-2">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" disabled={isSubmitting}
                                                            onClick={() => {
                                                                const title = window.prompt('Topic title (H2):')
                                                                if (title && editorRef.current) {
                                                                    editorRef.current.insertContent(`<h2 class=\"cm-topic\">${title}</h2>`)
                                                                }
                                                            }}>Add Topic</button>
                                                        <button type="button" className="btn btn-sm btn-outline-primary" disabled={isSubmitting}
                                                            onClick={() => {
                                                                const title = window.prompt('Subtopic title (H3):')
                                                                if (title && editorRef.current) {
                                                                    editorRef.current.insertContent(`<h3 class=\"cm-subtopic\">${title}</h3>`)
                                                                }
                                                            }}>Add Subtopic</button>
                                                        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={isSubmitting}
                                                            onClick={() => {
                                                                const text = window.prompt('Paragraph text:')
                                                                if (text && editorRef.current) {
                                                                    editorRef.current.insertContent(`<p>${text}</p>`)
                                                                }
                                                            }}>Add Paragraph</button>
                                                        <button type="button" className="btn btn-sm btn-outline-success" disabled={isSubmitting}
                                                            onClick={() => {
                                                                if (editorRef.current) {
                                                                    editorRef.current.insertContent('<ul>\n<li>Point one</li>\n<li>Point two</li>\n<li>Point three</li>\n</ul>')
                                                                }
                                                            }}>Add Bullet List</button>
                                                        <button type="button" className="btn btn-sm btn-outline-success" disabled={isSubmitting}
                                                            onClick={() => {
                                                                if (editorRef.current) {
                                                                    editorRef.current.insertContent('<ol>\n<li>Step one</li>\n<li>Step two</li>\n<li>Step three</li>\n</ol>')
                                                                }
                                                            }}>Add Numbered List</button>
                                                        <button type="button" className="btn btn-sm btn-outline-info" disabled={isSubmitting}
                                                            onClick={() => {
                                                                const text = window.prompt('Link text:')
                                                                const url = text !== null ? window.prompt('Link URL (https://...)') : null
                                                                if (text && url && editorRef.current) {
                                                                    const safeUrl = url.startsWith('http') ? url : `https://${url}`
                                                                    editorRef.current.insertContent(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`) 
                                                                }
                                                            }}>Insert Link</button>
                                                    </div>
                                                    <Editor
                                                        apiKey={process.env.REACT_APP_TINYMCE_API_KEY || 'no-api-key'}
                                                        id="content"
                                                        value={content}
                                                        onEditorChange={(value) => setContent(value)}
                                                        onInit={(evt, editor) => (editorRef.current = editor)}
                                                        init={{
                                                            height: 420,
                                                            menubar: true,
                                                            plugins: [
                                                                'advlist', 'autolink', 'lists', 'link', 'image', 'media',
                                                                'charmap', 'preview', 'anchor', 'searchreplace', 'visualblocks',
                                                                'code', 'fullscreen', 'insertdatetime', 'table', 'codesample',
                                                                'help', 'wordcount'
                                                            ],
                                                            toolbar: [
                                                                'undo redo | blocks styleselect fontselect fontsizeselect | bold italic underline strikethrough | forecolor backcolor removeformat',
                                                                'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | blockquote hr | link image media table | codesample | preview fullscreen'
                                                            ].join(' \n '),
                                                            branding: false,
                                                            automatic_uploads: true,
                                                            paste_data_images: true,
                                                            image_caption: true,
                                                            image_title: true,
                                                            file_picker_types: 'image',
                                                            file_picker_callback: (cb) => {
                                                                const input = document.createElement('input');
                                                                input.setAttribute('type', 'file');
                                                                input.setAttribute('accept', 'image/*');
                                                                input.onchange = () => {
                                                                    const file = input.files && input.files[0];
                                                                    if (!file) return;
                                                                    const reader = new FileReader();
                                                                    reader.onload = () => {
                                                                        const result = reader.result;
                                                                        if (typeof result === 'string') {
                                                                            cb(result, { title: file.name });
                                                                        }
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                };
                                                                input.click();
                                                            },
                                                            images_upload_handler: (blobInfo) => new Promise((resolve) => {
                                                                const base64 = blobInfo.base64();
                                                                resolve('data:' + blobInfo.blob().type + ';base64,' + base64);
                                                            }),
                                                            style_formats: [
                                                                { title: 'Topic Heading', block: 'h2', classes: 'cm-topic' },
                                                                { title: 'Subtopic Heading', block: 'h3', classes: 'cm-subtopic' },
                                                                { title: 'Highlight', inline: 'span', classes: 'cm-highlight' },
                                                                { title: 'Underline Dotted', inline: 'span', classes: 'cm-underline-dotted' },
                                                                { title: 'Underline Double', inline: 'span', classes: 'cm-underline-double' }
                                                            ],
                                                            content_style: `
                                                              h2.cm-topic { border-left: 6px solid #198754; padding-left: 10px; margin-top: 1.2em; color: #14532d; }
                                                              h3.cm-subtopic { border-left: 4px solid #0d6efd; padding-left: 8px; margin-top: 1em; color: #0a4275; }
                                                              .cm-highlight { background-color: #fff3cd; padding: 0 .15em; }
                                                              .cm-underline-dotted { text-decoration-line: underline; text-decoration-style: dotted; text-decoration-color: #6c757d; }
                                                              .cm-underline-double { text-decoration-line: underline; text-decoration-style: double; text-decoration-color: #6c757d; }
                                                              table { border-collapse: collapse; width: 100%; }
                                                              table td, table th { border: 1px solid #dee2e6; padding: 6px; }
                                                            `,
                                                        }}
                                                        disabled={isSubmitting}
                                                    />
                                                    <div className="form-field-focus-border"></div>
                                                </div>
                                                {errors.content && (
                                                    <div className="form-field-error">{errors.content}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {errors.submit && (
                                        <div className="alert alert-danger user-form-alert">{errors.submit}</div>
                                    )}

                                    <div className="form-actions">
                                        <Link to="/lessons" className="btn btn-cancel">
                                            <i className="fas fa-times me-2"></i>
                                            Cancel
                                        </Link>
                                        <button type="submit" className="btn btn-submit" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Saving...
                                                </>
                                            ) : id ? (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Update Lesson
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus me-2"></i>
                                                    Create Lesson
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddLessonComponent
