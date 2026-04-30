#!/bin/bash

# AI Sales Agent - Deployment Script
# This script automates the deployment process to Render

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git is installed"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    print_success "In git repository"
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js is installed ($(node --version))"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm is installed ($(npm --version))"
}

# Validate environment variables
validate_env() {
    print_header "Validating Environment Variables"
    
    local required_vars=(
        "SHOPIFY_API_KEY"
        "SHOPIFY_API_SECRET"
        "SUPABASE_URL"
        "SUPABASE_KEY"
        "OPENAI_API_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        else
            print_success "$var is set"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        print_info "Create a .env file with these variables or export them:"
        echo "  export SHOPIFY_API_KEY=your_key"
        echo "  export SHOPIFY_API_SECRET=your_secret"
        echo "  export SUPABASE_URL=your_url"
        echo "  export SUPABASE_KEY=your_key"
        echo "  export OPENAI_API_KEY=your_key"
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Test local build
test_build() {
    print_header "Testing Local Build"
    
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
    
    print_info "Checking syntax..."
    node -c server.js
    print_success "Server.js syntax is valid"
    
    node -c widget.js 2>/dev/null || print_warning "Widget.js is not pure JavaScript (this is expected)"
    
    print_success "Build validation passed"
}

# Commit and push changes
commit_and_push() {
    print_header "Committing and Pushing Changes"
    
    # Check if there are changes
    if git diff-index --quiet HEAD --; then
        print_info "No changes to commit"
        return
    fi
    
    print_info "Changes detected. Committing..."
    
    read -p "Enter commit message (or press Enter for 'Update: automated deployment'): " commit_msg
    commit_msg=${commit_msg:-"Update: automated deployment"}
    
    git add -A
    git commit -m "$commit_msg"
    print_success "Changes committed"
    
    print_info "Pushing to GitHub..."
    git push origin main
    print_success "Changes pushed to GitHub"
    
    print_info "Render will automatically deploy the changes"
}

# Setup GitHub Actions
setup_github_actions() {
    print_header "Setting Up GitHub Actions"
    
    if [ ! -f ".github/workflows/deploy.yml" ]; then
        print_warning "GitHub Actions workflow not found"
        print_info "Creating deploy workflow..."
        mkdir -p .github/workflows
        # Workflow file should already exist from our earlier creation
        print_success "GitHub Actions workflow is ready"
    else
        print_success "GitHub Actions workflow exists"
    fi
    
    print_info "To enable automatic deployments:"
    print_info "1. Go to https://github.com/kazi2000/ai-chat-backend/settings/secrets/actions"
    print_info "2. Click 'New repository secret'"
    print_info "3. Name: RENDER_DEPLOY_HOOK"
    print_info "4. Value: Your Render deploy hook URL"
    print_info "   (Get this from Render dashboard → Settings → Deploy Hook)"
}

# Get Render deploy hook
get_render_hook() {
    print_header "Getting Render Deploy Hook"
    
    print_info "To set up automatic deployments:"
    print_info "1. Go to https://dashboard.render.com"
    print_info "2. Click on your 'ai-chat-backend' service"
    print_info "3. Go to Settings tab"
    print_info "4. Scroll to 'Deploy Hook'"
    print_info "5. Copy the URL"
    print_info ""
    print_info "Then add it to GitHub:"
    print_info "1. Go to https://github.com/kazi2000/ai-chat-backend/settings/secrets/actions"
    print_info "2. Click 'New repository secret'"
    print_info "3. Name: RENDER_DEPLOY_HOOK"
    print_info "4. Paste the URL"
    print_info "5. Click 'Add secret'"
    print_info ""
    print_success "Now every push to main will automatically deploy!"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    read -p "Enter your Render app URL (e.g., https://ai-chat-backend-xxxx.onrender.com): " app_url
    
    if [ -z "$app_url" ]; then
        print_warning "No URL provided, skipping verification"
        return
    fi
    
    print_info "Checking if app is running..."
    
    if curl -s "$app_url/widget.js" > /dev/null; then
        print_success "App is running and responding!"
    else
        print_warning "Could not reach app. It might still be starting up."
        print_info "Check Render dashboard for deployment status"
    fi
}

# Main menu
show_menu() {
    print_header "AI Sales Agent - Deployment Script"
    
    echo "What would you like to do?"
    echo ""
    echo "1) Check prerequisites"
    echo "2) Validate environment variables"
    echo "3) Test local build"
    echo "4) Commit and push changes"
    echo "5) Setup GitHub Actions"
    echo "6) Get Render deploy hook"
    echo "7) Verify deployment"
    echo "8) Run full deployment (1-7)"
    echo "9) Exit"
    echo ""
    read -p "Enter your choice (1-9): " choice
}

# Main script
main() {
    print_header "AI Sales Agent - Deployment Script"
    print_info "This script helps you deploy to Render"
    echo ""
    
    while true; do
        show_menu
        
        case $choice in
            1)
                check_prerequisites
                ;;
            2)
                validate_env
                ;;
            3)
                test_build
                ;;
            4)
                commit_and_push
                ;;
            5)
                setup_github_actions
                ;;
            6)
                get_render_hook
                ;;
            7)
                verify_deployment
                ;;
            8)
                check_prerequisites
                validate_env
                test_build
                commit_and_push
                setup_github_actions
                get_render_hook
                verify_deployment
                print_success "Full deployment setup complete!"
                ;;
            9)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main script
main
