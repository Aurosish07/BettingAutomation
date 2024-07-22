FROM ghcr.io/puppeteer/puppeteer:22.10.0

# Install necessary dependencies for Xvfb
RUN apt-get update && \
    apt-get install -y xvfb dbus-x11 libgtk-3-0 libnss3 libxss1 libasound2 libgbm-dev libatk-bridge2.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 libxtst6 xauth --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Run the application
CMD ["node", "index.js"]
