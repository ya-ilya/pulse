# Stage 1: Build the Gradle application
FROM gradle:jdk21-alpine AS build

# Create app directory
WORKDIR /backend

# Copy the project files into the container
COPY gradle.properties settings.gradle.kts gradlew ./
COPY backend ./
COPY startup.backend.sh ./

# Build the application and cache dependencies
RUN --mount=type=cache,target=/root/.gradle gradle --no-daemon clean build

# Stage 3: Create the final image
FROM eclipse-temurin:21-jdk-alpine

# Create app directory
RUN mkdir /app

# Copy the built JAR file and startup script
COPY --from=build /backend/build/libs/*.jar /app/application.jar
COPY --from=build /backend/startup.backend.sh /app/startup.backend.sh

# Make the startup script executable
RUN chmod +x /app/startup.backend.sh

# Expose the application port
EXPOSE 3000-5005

# Set the entrypoint
ENTRYPOINT ["/bin/sh", "/app/startup.backend.sh"]