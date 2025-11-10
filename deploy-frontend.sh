#!/bin/bash

# Frontend Deployment Script for EC2
# This script builds and deploys the Next.js frontend to EC2

set -e  # Exit on any error

# Configuration
EC2_HOST="ec2-107-21-169-6.compute-1.amazonaws.com"
EC2_USER="ec2-user"
PEM_FILE="/c/Users/baluk/visio/bala_visio_backend.pem"
DEPLOY_DIR="/var/www/visio-registry"
PM2_APP_NAME="visio-registry"
BUILD_FILE="frontend-build.tar.gz"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Frontend Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Build the frontend
echo -e "${BLUE}[1/8]${NC} Building Next.js frontend..."
npm run build
echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${BLUE}[2/8]${NC} Creating deployment package..."
tar -czf $BUILD_FILE .next package.json package-lock.json public next.config.js .env.production
echo -e "${GREEN}✓ Package created${NC}"
echo ""

# Step 3: Upload to EC2
echo -e "${BLUE}[3/8]${NC} Uploading to EC2..."
scp -i $PEM_FILE $BUILD_FILE $EC2_USER@$EC2_HOST:~/$BUILD_FILE
echo -e "${GREEN}✓ Upload completed${NC}"
echo ""

# Step 4: Extract on EC2
echo -e "${BLUE}[4/8]${NC} Extracting build on EC2..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "cd $DEPLOY_DIR && sudo rm -rf .next && sudo tar -xzf ~/$BUILD_FILE && sudo chown -R $EC2_USER:$EC2_USER $DEPLOY_DIR"
echo -e "${GREEN}✓ Extraction completed${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${BLUE}[5/8]${NC} Installing production dependencies..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "cd $DEPLOY_DIR && npm install --omit=dev --legacy-peer-deps"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 6: Restart PM2
echo -e "${BLUE}[6/8]${NC} Restarting PM2 process..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "cd $DEPLOY_DIR && pm2 restart $PM2_APP_NAME && pm2 save"
echo -e "${GREEN}✓ PM2 restarted${NC}"
echo ""

# Step 7: Reload Nginx
echo -e "${BLUE}[7/8]${NC} Reloading Nginx..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "sudo nginx -t && sudo systemctl reload nginx"
echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

# Step 8: Cleanup
echo -e "${BLUE}[8/8]${NC} Cleaning up..."
ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "rm -f ~/$BUILD_FILE"
rm -f $BUILD_FILE
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""

# Verification
echo -e "${BLUE}Verifying deployment...${NC}"
RESPONSE=$(ssh -i $PEM_FILE $EC2_USER@$EC2_HOST "curl -s http://localhost:3000 | head -1")
if [ ! -z "$RESPONSE" ]; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
else
    echo -e "${RED}✗ Frontend verification failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Frontend URL: ${BLUE}http://$EC2_HOST${NC}"
echo ""
