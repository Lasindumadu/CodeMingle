# Database Schema Fix Plan

## Information Gathered
- **Current Issue**: Spring Boot application has database schema warnings about missing tables when trying to drop foreign keys
- **Root Cause**: The `data.sql` file only contains INSERT statements but no CREATE TABLE statements
- **Missing Tables**: comments, questions, quizzes tables are referenced but don't exist
- **Entity Analysis**: Found 7 JPA entities that need corresponding database tables:
  - users (parent table)
  - courses (parent table)
  - lessons (depends on courses)
  - enrollments (depends on users, courses, lessons)
  - quizzes (depends on lessons)
  - questions (depends on quizzes)
  - comments (depends on users, lessons)

## Plan
1. **✅ Create schema.sql** with proper CREATE TABLE statements in dependency order
2. **✅ Update data.sql** to include test data for all tables
3. **✅ Fix foreign key constraints** to prevent the drop warnings
4. **✅ Update application.properties** to use schema.sql instead of Hibernate auto-generation
5. **✅ Fix column naming** to use lowercase for MySQL compatibility
6. **Test the schema** by restarting the application

## Dependent Files to be edited
- `✅ codemingle-backend/src/main/resources/schema.sql` (create new with lowercase columns)
- `✅ codemingle-backend/src/main/resources/data.sql` (update existing with lowercase columns)
- `✅ codemingle-backend/src/main/resources/application.properties` (update existing)

## Followup steps
1. **Restart the Spring Boot application** to test the schema
2. **Verify all tables are created successfully** without warnings
3. **Confirm no more foreign key warnings** in logs
4. **Test the application functionality** to ensure all features work correctly
