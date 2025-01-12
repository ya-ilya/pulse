# Stage 1: Build the Gradle application and install Node.js
FROM gradle:jdk21-alpine AS build

# Install Node.js and npm
RUN apk --no-cache add nodejs npm

# Create app directory
WORKDIR /home/gradle/src

# Copy the entire project into the container
COPY --chown=gradle:gradle . .

# Install Node.js dependencies before the Gradle build
RUN npm install --prefix src/main/frontend

# Build the application and cache dependencies
RUN --mount=type=cache,target=/root/.gradle gradle --no-daemon build

# Stage 2: Create the final image
FROM openjdk:21-jdk-slim

# Create app directory
RUN mkdir /app

# Copy the built JAR file and startup script
COPY --from=build /home/gradle/src/build/libs/*.jar /app/application.jar
COPY --from=build /home/gradle/src/startup.pulse.sh /app/startup.pulse.sh

# Copy Node.js modules from the build stage
COPY --from=build /home/gradle/src/src/main/frontend/node_modules /home/gradle/src/src/main/frontend/node_modules

# Make the startup script executable
RUN chmod +x /app/startup.pulse.sh

# Expose the application port
EXPOSE 8080

# Set the entrypoint
ENTRYPOINT ["/bin/sh", "/app/startup.pulse.sh"]