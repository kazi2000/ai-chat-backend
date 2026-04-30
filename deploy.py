#!/usr/bin/env python3
"""
AI Sales Agent - Deployment Automation Script
Automates the deployment process to Render
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str) -> None:
    """Print a formatted header"""
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{text}{Colors.END}")
    print(f"{Colors.BLUE}{Colors.BOLD}{'='*50}{Colors.END}\n")

def print_success(text: str) -> None:
    """Print a success message"""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text: str) -> None:
    """Print an error message"""
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text: str) -> None:
    """Print a warning message"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text: str) -> None:
    """Print an info message"""
    print(f"{Colors.CYAN}ℹ {text}{Colors.END}")

def run_command(cmd: List[str], check: bool = True) -> Tuple[int, str]:
    """Run a shell command and return exit code and output"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode, result.stdout + result.stderr
    except Exception as e:
        return 1, str(e)

def check_prerequisites() -> bool:
    """Check if all prerequisites are installed"""
    print_header("Checking Prerequisites")
    
    prerequisites = {
        'git': ['git', '--version'],
        'node': ['node', '--version'],
        'npm': ['npm', '--version']
    }
    
    all_ok = True
    for name, cmd in prerequisites.items():
        code, output = run_command(cmd)
        if code == 0:
            version = output.strip().split('\n')[0]
            print_success(f"{name} is installed ({version})")
        else:
            print_error(f"{name} is not installed")
            all_ok = False
    
    # Check if in git repository
    code, _ = run_command(['git', 'rev-parse', '--git-dir'])
    if code == 0:
        print_success("In git repository")
    else:
        print_error("Not in a git repository")
        all_ok = False
    
    return all_ok

def validate_environment() -> bool:
    """Validate required environment variables"""
    print_header("Validating Environment Variables")
    
    required_vars = [
        'SHOPIFY_API_KEY',
        'SHOPIFY_API_SECRET',
        'SUPABASE_URL',
        'SUPABASE_KEY',
        'OPENAI_API_KEY'
    ]
    
    missing = []
    for var in required_vars:
        if os.getenv(var):
            print_success(f"{var} is set")
        else:
            print_warning(f"{var} is not set")
            missing.append(var)
    
    if missing:
        print_error(f"Missing {len(missing)} environment variable(s)")
        print_info("Set them with:")
        for var in missing:
            print(f"  export {var}=your_value")
        return False
    
    return True

def test_build() -> bool:
    """Test the local build"""
    print_header("Testing Local Build")
    
    print_info("Installing dependencies...")
    code, output = run_command(['npm', 'install'])
    if code == 0:
        print_success("Dependencies installed")
    else:
        print_error("Failed to install dependencies")
        print(output)
        return False
    
    print_info("Checking server.js syntax...")
    code, _ = run_command(['node', '-c', 'server.js'])
    if code == 0:
        print_success("server.js syntax is valid")
    else:
        print_error("server.js has syntax errors")
        return False
    
    print_success("Build validation passed")
    return True

def commit_and_push() -> bool:
    """Commit and push changes to GitHub"""
    print_header("Committing and Pushing Changes")
    
    # Check for changes
    code, output = run_command(['git', 'diff-index', '--quiet', 'HEAD', '--'])
    if code == 0:
        print_info("No changes to commit")
        return True
    
    print_info("Changes detected")
    
    # Get commit message
    msg = input("Enter commit message (or press Enter for default): ").strip()
    if not msg:
        msg = "Update: automated deployment"
    
    # Add changes
    print_info("Staging changes...")
    code, _ = run_command(['git', 'add', '-A'])
    if code != 0:
        print_error("Failed to stage changes")
        return False
    print_success("Changes staged")
    
    # Commit
    print_info("Committing changes...")
    code, _ = run_command(['git', 'commit', '-m', msg])
    if code != 0:
        print_error("Failed to commit changes")
        return False
    print_success("Changes committed")
    
    # Push
    print_info("Pushing to GitHub...")
    code, output = run_command(['git', 'push', 'origin', 'main'])
    if code != 0:
        print_error("Failed to push changes")
        print(output)
        return False
    print_success("Changes pushed to GitHub")
    print_info("Render will automatically deploy the changes")
    
    return True

def setup_github_actions() -> bool:
    """Setup GitHub Actions for automatic deployment"""
    print_header("Setting Up GitHub Actions")
    
    workflow_path = Path('.github/workflows/deploy.yml')
    
    if workflow_path.exists():
        print_success("GitHub Actions workflow exists")
    else:
        print_warning("GitHub Actions workflow not found")
        print_info("Creating workflow directory...")
        workflow_path.parent.mkdir(parents=True, exist_ok=True)
        print_success("Workflow directory created")
    
    print_info("To enable automatic deployments:")
    print("  1. Go to https://github.com/kazi2000/ai-chat-backend/settings/secrets/actions")
    print("  2. Click 'New repository secret'")
    print("  3. Name: RENDER_DEPLOY_HOOK")
    print("  4. Value: Your Render deploy hook URL")
    print("     (Get from Render dashboard → Settings → Deploy Hook)")
    
    return True

def get_render_hook() -> None:
    """Display instructions for getting Render deploy hook"""
    print_header("Getting Render Deploy Hook")
    
    print_info("To set up automatic deployments:")
    print("  1. Go to https://dashboard.render.com")
    print("  2. Click on your 'ai-chat-backend' service")
    print("  3. Go to Settings tab")
    print("  4. Scroll to 'Deploy Hook'")
    print("  5. Copy the URL")
    print("")
    print_info("Then add it to GitHub:")
    print("  1. Go to https://github.com/kazi2000/ai-chat-backend/settings/secrets/actions")
    print("  2. Click 'New repository secret'")
    print("  3. Name: RENDER_DEPLOY_HOOK")
    print("  4. Paste the URL")
    print("  5. Click 'Add secret'")
    print("")
    print_success("Now every push to main will automatically deploy!")

def verify_deployment() -> None:
    """Verify the deployment"""
    print_header("Verifying Deployment")
    
    app_url = input("Enter your Render app URL (e.g., https://ai-chat-backend-xxxx.onrender.com): ").strip()
    
    if not app_url:
        print_warning("No URL provided, skipping verification")
        return
    
    print_info("Checking if app is running...")
    
    try:
        import urllib.request
        urllib.request.urlopen(f"{app_url}/widget.js", timeout=5)
        print_success("App is running and responding!")
    except Exception as e:
        print_warning(f"Could not reach app: {e}")
        print_info("It might still be starting up. Check Render dashboard for status.")

def show_menu() -> str:
    """Display the main menu and get user choice"""
    print_header("AI Sales Agent - Deployment Script")
    
    print("What would you like to do?")
    print("")
    print("1) Check prerequisites")
    print("2) Validate environment variables")
    print("3) Test local build")
    print("4) Commit and push changes")
    print("5) Setup GitHub Actions")
    print("6) Get Render deploy hook")
    print("7) Verify deployment")
    print("8) Run full deployment (1-7)")
    print("9) Exit")
    print("")
    
    choice = input("Enter your choice (1-9): ").strip()
    return choice

def main() -> None:
    """Main function"""
    print_header("AI Sales Agent - Deployment Script")
    print_info("This script helps you deploy to Render")
    
    while True:
        choice = show_menu()
        
        if choice == '1':
            if not check_prerequisites():
                print_error("Prerequisites check failed")
        
        elif choice == '2':
            if not validate_environment():
                print_error("Environment validation failed")
        
        elif choice == '3':
            if not test_build():
                print_error("Build test failed")
        
        elif choice == '4':
            if not commit_and_push():
                print_error("Commit and push failed")
        
        elif choice == '5':
            if not setup_github_actions():
                print_error("GitHub Actions setup failed")
        
        elif choice == '6':
            get_render_hook()
        
        elif choice == '7':
            verify_deployment()
        
        elif choice == '8':
            print_info("Running full deployment...")
            if check_prerequisites():
                if validate_environment():
                    if test_build():
                        if commit_and_push():
                            if setup_github_actions():
                                get_render_hook()
                                verify_deployment()
                                print_success("Full deployment setup complete!")
        
        elif choice == '9':
            print_info("Goodbye!")
            sys.exit(0)
        
        else:
            print_error("Invalid choice. Please try again.")
        
        print("")
        input("Press Enter to continue...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print_info("\nDeployment script cancelled by user")
        sys.exit(0)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
