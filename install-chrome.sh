#!/bin/bash

# Update package list and install dependencies
apt-get update
apt-get install -y wget gnupg

# Download the Google Chrome .deb package
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install the .deb package
dpkg -i google-chrome-stable_current_amd64.deb

# Fix missing dependencies
apt-get install -y -f

# Remove the .deb package
rm google-chrome-stable_current_amd64.deb
