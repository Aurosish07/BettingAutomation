# Use the Puppeteer base image
FROM ghcr.io/puppeteer/puppeteer:22.10.0

# Install necessary dependencies as root user
USER root
RUN apt-get update && \
    apt-get install -y \
    xvfb \
    dbus-x11 \
    libgtk-3-0 \
    libnss3 \
    libxss1 \
    libasound2 \
    libgbm-dev \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Run the application with xvfb-run
CMD ["xvfb-run", "--auto-servernum", "--server-args=-screen 0 1024x768x24", "node", "index.js"]
