# TODO: Update Lesson Page Styling to Match User Update Page

## Overview
Modify the AddLessonComponent.js to use the same layout structure and CSS classes as AddUserComponent.js for consistent styling across the application.

## Tasks
- [ ] Update the main container structure from Bootstrap card layout to user-form-container layout
- [ ] Replace card header with user-form-header structure including avatar icon and title
- [ ] Update form body to use user-form-body class
- [ ] Modify form structure to use form-section and form-field-group classes
- [ ] Update form fields to use form-field, form-field-label, form-field-input-wrapper, etc. classes
- [ ] Update error messages to use user-form-alert class
- [ ] Update buttons to use btn btn-cancel and btn btn-submit classes with icons
- [ ] Update title function to return JSX with icons like user update page
- [ ] Ensure all form validation and submission logic remains intact
- [ ] Test the updated component to ensure functionality is preserved

## Files to Modify
- codemingle-frontend/src/components/AddLessonComponent.js

## Dependencies
- Relies on existing user-form CSS classes in ListComponents.css
- No new CSS files needed as styles are already defined

## Testing
- Verify form loads correctly for both add and update modes
- Test form validation works properly
- Ensure submission works for both create and update operations
- Check responsive design on different screen sizes
