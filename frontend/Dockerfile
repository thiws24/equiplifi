# Use the official Node.js image as the base image.
FROM node:20 AS build

# TODO: Remove and set in github workflow
# Set args
ARG NODE_ENV=production
ARG REACT_APP_II_SERVICE_HOST="http://ii.equipli.de"

# Env variables
ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_II_SERVICE_HOST=$REACT_APP_II_SERVICE_HOST

# Set the working directory.
WORKDIR /app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm ci

# Copy the rest of the application code.
COPY . .

# Build the React application.
RUN npm run build

# Install the static file serving "serve"
RUN npm install -g serve

# Expose port 3000 to the outside world.
EXPOSE 3000

# Command to run the web server.
CMD ["serve", "-sn", "build"]