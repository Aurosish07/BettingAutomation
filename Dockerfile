FROM ghcr.io/puppeteer/puppeteer:22.10.0

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Update package list
RUN apt-get update

# Install necessary dependencies for headful Puppeteer
RUN apt-get install -y xvfb
RUN apt-get install -y dbus-x11
RUN apt-get install -y libgtk-3-0
RUN apt-get install -y libnss3
RUN apt-get install -y libxss1
RUN apt-get install -y libasound2
RUN apt-get install -y libgbm-dev
RUN apt-get install -y libatk-bridge2.0-0
RUN apt-get install -y libx11-xcb1
RUN apt-get install -y libxcomposite1
RUN apt-get install -y libxcursor1
RUN apt-get install -y libxdamage1
RUN apt-get install -y libxi6
RUN apt-get install -y libxtst6
RUN apt-get install -y xauth
RUN rm -rf /var/lib/apt/lists/*

# Copy the rest of your application code
COPY . .

# Run the application with xvfb-run
CMD ["xvfb-run", "--auto-servernum", "--server-args=-screen 0 1024x768x24", "npm", "start"]
