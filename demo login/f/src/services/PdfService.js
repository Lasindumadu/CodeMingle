import jsPDF from 'jspdf'

class PdfService {
    static generateQuizResultsPDF(quiz, questions, answers, score, totalQuestions) {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.width
        const margin = 20
        let yPosition = margin

        // Helper function to add text with word wrapping
        const addText = (text, x, y, maxWidth, fontSize = 12, style = 'normal') => {
            doc.setFontSize(fontSize)
            doc.setFont('helvetica', style)
            const lines = doc.splitTextToSize(text, maxWidth)
            doc.text(lines, x, y)
            return y + (lines.length * fontSize * 0.4) + 5
        }

        // Helper function to add a new page if needed
        const checkNewPage = (requiredSpace) => {
            if (yPosition + requiredSpace > doc.internal.pageSize.height - margin) {
                doc.addPage()
                yPosition = margin
                return true
            }
            return false
        }

        // Title
        doc.setFillColor(79, 172, 254)
        doc.rect(0, 0, pageWidth, 30, 'F')
        
        doc.setTextColor(255, 255, 255)
        yPosition = addText('QUIZ RESULTS', pageWidth / 2, 20, pageWidth - 2 * margin, 20, 'bold')
        doc.setTextColor(0, 0, 0)

        // Quiz Information
        yPosition += 10
        yPosition = addText(`Quiz: ${quiz.title}`, margin, yPosition, pageWidth - 2 * margin, 16, 'bold')
        yPosition = addText(`Description: ${quiz.description || 'No description provided'}`, margin, yPosition, pageWidth - 2 * margin, 12)
        
        // Score Section
        yPosition += 15
        const percentage = Math.round((score / totalQuestions) * 100)
        const grade = this.getGrade(percentage)
        const motivation = this.getMotivationMessage(percentage)

        doc.setFillColor(240, 248, 255)
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 60, 'F')
        
        yPosition = addText('SCORE SUMMARY', margin + 5, yPosition + 10, pageWidth - 2 * margin, 14, 'bold')
        yPosition = addText(`Correct Answers: ${score} out of ${totalQuestions}`, margin + 5, yPosition, pageWidth - 2 * margin, 12)
        yPosition = addText(`Percentage: ${percentage}%`, margin + 5, yPosition, pageWidth - 2 * margin, 12)
        yPosition = addText(`Grade: ${grade}`, margin + 5, yPosition, pageWidth - 2 * margin, 12)
        yPosition = addText(`Motivation: ${motivation}`, margin + 5, yPosition, pageWidth - 2 * margin, 12)

        // Questions and Answers
        yPosition += 20
        yPosition = addText('QUESTIONS AND ANSWERS', margin, yPosition, pageWidth - 2 * margin, 16, 'bold')

        questions.forEach((question, index) => {
            checkNewPage(50) // Reserve space for question
            
            yPosition += 10
            yPosition = addText(`Question ${index + 1}:`, margin, yPosition, pageWidth - 2 * margin, 14, 'bold')
            yPosition = addText(question.questionText, margin + 10, yPosition, pageWidth - 2 * margin - 10, 12)
            
            // Options
            yPosition += 5
            const options = ['A', 'B', 'C', 'D']
            options.forEach(option => {
                const optionText = question[`option${option}`]
                const isCorrect = question.correctAnswer === option
                const isSelected = answers[question.questionId] === option
                
                let optionDisplay = `${option}. ${optionText}`
                if (isCorrect) {
                    optionDisplay += ' ✓ (Correct Answer)'
                }
                if (isSelected && !isCorrect) {
                    optionDisplay += ' ✗ (Your Answer)'
                }
                if (isSelected && isCorrect) {
                    optionDisplay += ' ✓ (Your Correct Answer)'
                }
                
                yPosition = addText(optionDisplay, margin + 20, yPosition, pageWidth - 2 * margin - 20, 11)
            })
            
            yPosition += 10
        })

        // Footer
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.setTextColor(128, 128, 128)
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10)
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.height - 10)
        }

        return doc
    }

    static getGrade(percentage) {
        if (percentage >= 90) return 'A+'
        if (percentage >= 85) return 'A'
        if (percentage >= 80) return 'A-'
        if (percentage >= 75) return 'B+'
        if (percentage >= 70) return 'B'
        if (percentage >= 65) return 'B-'
        if (percentage >= 60) return 'C+'
        if (percentage >= 55) return 'C'
        if (percentage >= 50) return 'C-'
        if (percentage >= 45) return 'D+'
        if (percentage >= 40) return 'D'
        return 'F'
    }

    static getMotivationMessage(percentage) {
        if (percentage >= 90) return 'Outstanding! You have mastered this topic completely!'
        if (percentage >= 80) return 'Excellent work! You have a strong understanding of the material.'
        if (percentage >= 70) return 'Great job! You have a good grasp of the concepts.'
        if (percentage >= 60) return 'Good effort! You understand most of the material well.'
        if (percentage >= 50) return 'Not bad! You have a basic understanding, keep studying!'
        if (percentage >= 40) return 'Keep working hard! Review the material and try again.'
        return 'Don\'t give up! Study the material thoroughly and retake the quiz.'
    }

    static downloadQuizResults(quiz, questions, answers, score, totalQuestions) {
        const doc = this.generateQuizResultsPDF(quiz, questions, answers, score, totalQuestions)
        const fileName = `Quiz_Results_${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
    }
}

export default PdfService
