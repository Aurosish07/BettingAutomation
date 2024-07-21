#!/bin/bash

# Install Xvfb and xauth
sudo apt-get update
sudo apt-get install -y xvfb xauth

# Start the application with xvfb-run
xvfb-run --auto-servernum --server-args='-screen 0 1024x768x24' npm run start
