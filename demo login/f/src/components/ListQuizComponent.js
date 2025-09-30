import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import QuizService from '../services/QuizService'
import PdfService from '../services/PdfService'
import AuthService from '../services/AuthService'
import { useAuth } from '../context/AuthContext'
import './ListComponents.css'

const ListQuizComponent = () => {
    const { user: currentUser, isAuthenticated, isAdmin } = useAuth()
    const [quizzes, setQuizzes] = useState([])
    const [filteredQuizzes, setFilteredQuizzes] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)
    const [sortField, setSortField] = useState('quizId')
    const [sortOrder, setSortOrder] = useState('asc')
    const [completedQuizzes, setCompletedQuizzes] = useState([])

    useEffect(() => {
        getAllQuizzes();
        loadCompletedQuizzes();
    }, [])

    const loadCompletedQuizzes = () => {
        const completions = JSON.parse(localStorage.getItem('quizCompletions') || '[]')
        setCompletedQuizzes(completions)
    }

    const isQuizCompleted = (quizId) => {
        return completedQuizzes.some(completion => completion.quizId === quizId)
    }

    const getCompletionData = (quizId) => {
        return completedQuizzes.find(completion => completion.quizId === quizId)
    }

    const handleDownloadPDF = async (quizId) => {
        try {
            const completionData = getCompletionData(quizId)
            if (!completionData) return

            // Fetch the quiz details to get questions
            const response = await QuizService.getQuizById(quizId)
            const quiz = response.data
            
            // Create a mock questions array for PDF generation
            const questions = quiz.questions || []
            
            PdfService.downloadQuizResults(
                quiz, 
                questions, 
                completionData.answers, 
                completionData.score, 
                completionData.totalQuestions
            )
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Error downloading PDF. Please try again.')
        }
    }

    const handlePrintResults = async (quizId) => {
        try {
            const completionData = getCompletionData(quizId)
            if (!completionData) return

            // Fetch the quiz details to get questions
            const response = await QuizService.getQuizById(quizId)
            const quiz = response.data
            
            // Create a printable results page
            const printWindow = window.open('', '_blank')
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Quiz Results - ${quiz.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                            .result-summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                            .grade { font-size: 24px; font-weight: bold; color: #28a745; }
                            .details { margin-top: 20px; }
                            .detail-row { margin: 10px 0; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Quiz Results</h1>
                            <h2>${quiz.title}</h2>
                        </div>
                        <div class="result-summary">
                            <div class="grade">Grade: ${completionData.grade} (${completionData.percentage}%)</div>
                            <div class="details">
                                <div class="detail-row"><strong>Score:</strong> ${completionData.score} out of ${completionData.totalQuestions}</div>
                                <div class="detail-row"><strong>Completion Date:</strong> ${new Date(completionData.completedAt).toLocaleDateString()}</div>
                                <div class="detail-row"><strong>Quiz ID:</strong> ${quiz.quizId}</div>
                                <div class="detail-row"><strong>Lesson ID:</strong> ${quiz.lessonId}</div>
                            </div>
                        </div>
                        <div class="description">
                            <h3>Quiz Description:</h3>
                            <p>${quiz.description}</p>
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.print()
        } catch (error) {
            console.error('Error printing results:', error)
            alert('Error printing results. Please try again.')
        }
    }

    const handleViewHistory = (quizId) => {
        const completionData = getCompletionData(quizId)
        if (!completionData) {
            alert('No quiz history found. Take the quiz first!')
            return
        }

        // Create a modal or alert showing quiz history
        const historyDetails = `
Quiz History Details:

Quiz ID: ${quizId}
Completion Date: ${new Date(completionData.completedAt).toLocaleDateString()}
Score: ${completionData.score} out of ${completionData.totalQuestions}
Percentage: ${completionData.percentage}%
Grade: ${completionData.grade}
Time Taken: ${completionData.timeTaken || 'Not recorded'}

You can download or print your results using the respective buttons.
        `
        alert(historyDetails)
    }

    useEffect(() => {
        const filtered = quizzes.filter(quiz =>
            (quiz.title && quiz.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (quiz.lessonId && quiz.lessonId.toString().includes(searchTerm))
        );
        setFilteredQuizzes(sortQuizzes(filtered));
    }, [quizzes, searchTerm, sortField, sortOrder])

    const sortQuizzes = (quizzes) => {
        return [...quizzes].sort((a, b) => {
            let aValue, bValue;
            switch (sortField) {
                case 'quizId':
                    aValue = a.quizId;
                    bValue = b.quizId;
                    break;
                case 'title':
                    aValue = a.title || '';
                    bValue = b.title || '';
                    break;
                case 'lessonId':
                    aValue = a.lessonId;
                    bValue = b.lessonId;
                    break;
                case 'description':
                    aValue = a.description || '';
                    bValue = b.description || '';
                    break;
                default:
                    return 0;
            }
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }


    const getAllQuizzes = () => {
        QuizService.getAllQuizzes().then((response) => {
            setQuizzes(response.data)
            console.log(response.data);
        }).catch(error =>{
            console.log(error);
        })
    }

    const deleteQuiz = (quizId) => {
       QuizService.deleteQuiz(quizId).then((response) =>{
        getAllQuizzes();
       }).catch(error =>{
           console.log(error);
       })
    }

    const truncateDescription = (description, maxLength = 150) => {
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(10) // Reset pagination on search
    }

    const loadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    return (
        <div className="list-page-container">
            <div className="container">
                <div className="list-header d-flex justify-content-between align-items-center mb-4">
                    <h2 className="list-title mb-0">Quizzes</h2>
                    {isAdmin() && (
                        <Link to="/add-quiz" className="btn btn-success btn-lg add-button" title="Add a new quiz">
                            <i className="fas fa-plus me-2"></i>Add Quiz
                        </Link>
                    )}
                </div>

                {quizzes.length > 0 && (
                    <div className="search-container mb-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by title or lesson ID..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{paddingRight: '8rem'}}
                        />
                        <i className="fas fa-search search-icon" style={{right: '40px'}}></i>
                    </div>
                )}

                {quizzes.length > 0 && (
                    <div className="sort-container mb-4 d-flex gap-3">
                        <div className="form-group" style={{width: '150px'}}>
                            <label htmlFor="sortField" className="form-label">Sort by:</label>
                            <select
                                id="sortField"
                                className="form-select"
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value)}
                            >
                                <option value="quizId">ID</option>
                                <option value="title">Title</option>
                                <option value="lessonId">Lesson ID</option>
                                <option value="description">Description</option>
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


                {filteredQuizzes.length === 0 ? (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-brain fa-3x text-muted mb-3"></i>
                        <h4 className="empty-title">{searchTerm ? 'No quizzes match your search' : 'No quizzes available'}</h4>
                        <p className="empty-text">{searchTerm ? 'Try adjusting your search terms.' : 'Start by adding your first quiz!'}</p>
                    </div>
                ) : (
                    <>
                        <div className="list-card-container">
                            {filteredQuizzes.slice(0, visibleCount).map(quiz => {
                                const isCompleted = isQuizCompleted(quiz.quizId)
                                const completionData = getCompletionData(quiz.quizId)
                                
                                return (
                                    <div key={quiz.quizId} className="list-card text-center">
                                        <i className="fas fa-brain card-icon fa-2x text-primary mb-3"></i>
                                        <h5 className="card-title">{quiz.title}</h5>
                                        
                                        {isCompleted && completionData && (
                                            <div className="completion-badge mb-2">
                                                <span className="badge bg-success">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    Completed - Grade: {completionData.grade} ({completionData.percentage}%)
                                                </span>
                                            </div>
                                        )}
                                        
                                        <div className="card-content">
                                            <p className="mb-2">
                                                <strong>Lesson ID:</strong> {quiz.lessonId}
                                            </p>
                                            <div className="quiz-meta-badges mb-3">
                                                <span className="badge bg-warning">
                                                    <i className="fas fa-clock me-1"></i>
                                                    {quiz.timeLimitMinutes || 30} min
                                                </span>
                                                <span className="badge bg-success">
                                                    <i className="fas fa-question-circle me-1"></i>
                                                    {quiz.questions ? quiz.questions.length : 0} questions
                                                </span>
                                            </div>
                                            <p className="mb-3">
                                                <strong>Description:</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {truncateDescription(quiz.description)}
                                                </small>
                                            </p>
                                        </div>
                                        <div className="card-actions mt-auto d-flex gap-2 flex-wrap">
                                            {isAdmin() ? (
                                                // Admin buttons: Edit and Delete
                                                <>
                                                    <Link
                                                        className="btn btn-outline-primary btn-sm flex-fill"
                                                        to={`/edit-quiz/${quiz.quizId}`}
                                                        title="Edit this quiz"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fas fa-edit me-1"></i>Edit
                                                    </Link>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm flex-fill"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to delete this quiz?')) {
                                                                deleteQuiz(quiz.quizId);
                                                            }
                                                        }}
                                                        title="Delete this quiz"
                                                    >
                                                        <i className="fas fa-trash me-1"></i>Delete
                                                    </button>
                                                </>
                                            ) : (
                                                // User buttons: Do Quiz and View History
                                                <>
                                                    <Link
                                                        className="btn btn-success btn-sm flex-fill"
                                                        to={`/take-quiz/${quiz.quizId}`}
                                                        title="Start this quiz"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <i className="fas fa-play me-1"></i>Start Quiz
                                                    </Link>
                                                    
                                                    <button
                                                        className="btn btn-info btn-sm flex-fill"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewHistory(quiz.quizId);
                                                        }}
                                                        title="View quiz history and results"
                                                    >
                                                        <i className="fas fa-history me-1"></i>View History
                                                    </button>
                                                    
                                                    {/* PDF and Print buttons for completed quizzes */}
                                                    {isCompleted && (
                                                        <>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm flex-fill"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDownloadPDF(quiz.quizId);
                                                                }}
                                                                title="Download results as PDF"
                                                            >
                                                                <i className="fas fa-file-pdf me-1"></i>PDF
                                                            </button>
                                                            <button
                                                                className="btn btn-outline-secondary btn-sm flex-fill"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePrintResults(quiz.quizId);
                                                                }}
                                                                title="Print results"
                                                            >
                                                                <i className="fas fa-print me-1"></i>Print
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {filteredQuizzes.length > visibleCount && (
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
    )
}

export default ListQuizComponent;
