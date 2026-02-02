#!/bin/bash

set -e

echo "=========================================="
echo "Pomodoro Timer App - Development Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for Node.js
echo -e "${BLUE}Checking for Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed.${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}Node.js found: $(node --version)${NC}"
echo ""

# Check for npm
echo -e "${BLUE}Checking for npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed.${NC}"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi
echo -e "${GREEN}npm found: $(npm --version)${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}Dependencies installed successfully${NC}"
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi
echo ""

# Check for package.json
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}package.json not found. Creating a basic one...${NC}"
    npm init -y
    echo -e "${GREEN}package.json created${NC}"
    echo ""
fi

echo -e "${BLUE}Starting development server...${NC}"
echo -e "${GREEN}Ready to develop!${NC}"
echo ""

# Start the dev server
npm run dev
