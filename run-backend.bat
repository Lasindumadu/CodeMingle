@echo off
echo Starting CodeMingle Backend...

REM Set Java options for better memory management
set JAVA_OPTS=-Xmx1G -Xms256m -XX:+UseG1GC -XX:+UseStringDeduplication -Djava.awt.headless=true

REM Navigate to the backend directory
cd codemingle-backend

REM Run the Spring Boot application
mvn spring-boot:run

pause
