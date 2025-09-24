import React, {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import QuizService from '../services/QuizService'
import PdfService from '../services/PdfService'
import './ListComponents.css'

const ListQuizComponent = () => {

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
                    <Link to="/add-quiz" className="btn btn-success btn-lg add-button" title="Add a new quiz">
                        <i className="fas fa-plus me-2"></i>Add Quiz
                    </Link>
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
                                            <p className="mb-3">
                                                <strong>Description:</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {truncateDescription(quiz.description)}
                                                </small>
                                            </p>
                                        </div>
                                        <div className="card-actions mt-auto d-flex gap-2 flex-wrap">
                                            <Link
                                                className="btn btn-success btn-sm flex-fill"
                                                to={`/take-quiz/${quiz.quizId}`}
                                                title="Take this quiz"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <i className="fas fa-play me-1"></i>Take Quiz
                                            </Link>
                                            
                                            {isCompleted && (
                                                <button
                                                    className="btn btn-info btn-sm flex-fill"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadPDF(quiz.quizId);
                                                    }}
                                                    title="Download results PDF"
                                                >
                                                    <i className="fas fa-download me-1"></i>Download PDF
                                                </button>
                                            )}
                                            
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
                                                    deleteQuiz(quiz.quizId);
                                                }}
                                                title="Delete this quiz"
                                            >
                                                <i className="fas fa-trash me-1"></i>Delete
                                            </button>
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
