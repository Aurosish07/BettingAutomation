# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg2 && \
    wget -qO - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
    echo "deb https://deb.nodesource.com/node_20.x bullseye main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y \
    xvfb \
    xauth \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    libx11-xcb-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Define environment variable
ENV NODE_ENV=production

# Run the application
CMD ["xvfb-run", "--auto-servernum", "--server-args=-screen 0 1024x768x24", "npm", "run", "start"]
