# TODO: Make Profile Views and Ratings Dynamic in User Cards

## Tasks
- [x] Add profileViews (Integer) and rating (Double) fields to User.java model
- [x] Update schema_mysql.sql to include profile_views and rating columns in users table
- [x] Check and update UserController.java if needed to handle new fields
- [x] Modify ListUserComponent.js to display selectedUser.profileViews and selectedUser.rating instead of hardcoded values
- [x] Add function to increment profileViews (API available for manual use)
- [x] Add function to calculate rating based on user activity (API available for manual use)
- [x] Test the changes and ensure database schema is updated
