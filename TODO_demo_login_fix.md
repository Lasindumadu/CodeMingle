# Demo Login Fix - TODO

## Problem
- Frontend AuthService.js makes POST request to `/api/v1/auth/demo-login`
- Backend returns 500 Internal Server Error
- No AuthController exists in the main backend application

## Root Cause
- Demo-login endpoint exists in standalone file but not integrated into Spring Boot application
- Missing proper AuthController in the main backend structure

## Plan
1. [x] Analyze existing code structure and dependencies
2. [ ] Create AuthController.java in proper location
3. [ ] Migrate demo-login endpoint logic from standalone file
4. [ ] Add proper error handling and response structure
5. [ ] Test the endpoint functionality
6. [ ] Verify frontend integration

## Files to Create/Modify
- [ ] `codemingle-backend/src/main/java/com/example/codemingle_backend/controller/AuthController.java` (new)
- [ ] `demo_login_endpoint.java` (reference only, may be removed)

## Dependencies Available
- [x] JwtUtil.java - for token generation
- [x] UserRepository.java - for finding demo users
- [x] User.java model - with username, password, role fields
- [x] JWT dependencies in pom.xml

## Expected Response Format
Frontend expects: `{token, username, role, timestamp}`
