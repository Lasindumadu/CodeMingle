# Quiz Tick Mark and Shuffle Fix TODO

## Overview
Fixing the tick mark visibility issue in quiz taking (add visual check icon on option selection) while confirming shuffle functionality. Add/update quiz features are already implemented.

## Steps
- [x] Edit codemingle-frontend/src/components/QuizTakingComponent.js: Add a conditional check icon (<i className="fas fa-check option-check">) in the option-label for selected options when !isSubmitted (pre-submission feedback).
- [x] Position the icon at the end of the label (using margin-left: auto via CSS class or inline).
- [x] Ensure icon is white on selected background for visibility.
- [ ] Test: Run frontend, take a quiz, select options, verify tick appears. Confirm shuffle randomizes questions if enabled.
- [x] No changes needed for AddQuizComponent.js (shuffle toggle already works for add/update).
- [x] Mark this step complete and update TODO.md.
- [ ] If issues, investigate QuizService.js or backend.

## Notes
- Keep radio input visible for accessibility.
- After JS edit, restart dev server if needed (npm start in frontend dir).
