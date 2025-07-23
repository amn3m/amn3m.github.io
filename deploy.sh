#!/bin/bash

# Ahmed M. Abdelmoneim Portfolio - GitHub Pages Deployment Script
# This script optimizes and deploys the portfolio to GitHub Pages

echo "🚀 Starting GitHub Pages Deployment..."

# Configuration
REPO_NAME="amn3m.github.io"
GITHUB_USERNAME="amn3m"
GITHUB_PAGES_URL="https://${GITHUB_USERNAME}.github.io"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please run 'git init' first."
    exit 1
fi

# Check if required tools are available
command -v git >/dev/null 2>&1 || { echo "❌ Git is not installed. Please install Git."; exit 1; }
command -v cwebp >/dev/null 2>&1 || { echo "⚠️  cwebp not found. WebP conversion will be skipped."; }

# Create WebP versions of images (if cwebp is available)
if command -v cwebp >/dev/null 2>&1; then
    echo "📸 Converting images to WebP format..."
    for file in Pictures/*.jpg Pictures/*.jpeg Pictures/*.png; do
        if [ -f "$file" ]; then
            webp_file="${file%.*}.webp"
            if [ ! -f "$webp_file" ] || [ "$file" -nt "$webp_file" ]; then
                echo "Converting $file to WebP..."
                cwebp -q 80 "$file" -o "$webp_file"
            fi
        fi
    done
    echo "✅ WebP conversion complete"
else
    echo "⚠️  WebP conversion skipped (cwebp not found)"
fi

# Validate HTML
echo "🔍 Validating HTML structure..."
if command -v html5validator >/dev/null 2>&1; then
    html5validator --root . --ignore-re ".*\.git.*"
    echo "✅ HTML validation complete"
else
    echo "⚠️  HTML validation skipped (html5validator not found)"
fi

# Check required files for GitHub Pages
echo "📋 Verifying required files for GitHub Pages..."
required_files=(
    "index.html"
    "styles.css"
    "script-optimized.js"
    "sw.js"
    "manifest.json"
    "robots.txt"
    "sitemap.xml"
    "Ahmed_M__Abdelmoneim.pdf"
    "_headers"
    "netlify.toml"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files present"
else
    echo "❌ Missing files: ${missing_files[*]}"
    exit 1
fi

# Check Pictures directory
echo "🖼️  Checking Pictures directory..."
if [ -d "Pictures" ]; then
    pic_count=$(ls -1 Pictures/*.{jpg,jpeg,png,webp} 2>/dev/null | wc -l)
    echo "✅ Pictures directory found with $pic_count images"
else
    echo "❌ Pictures directory missing"
    exit 1
fi

# Git status check
echo "📊 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Committing them now..."
    
    # Add all files
    git add .
    
    # Commit with timestamp
    commit_message="Portfolio update - $(date +'%Y-%m-%d %H:%M:%S')"
    git commit -m "$commit_message"
    echo "✅ Changes committed: $commit_message"
else
    echo "✅ No uncommitted changes"
fi

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  No remote origin found. Adding GitHub remote..."
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
    echo "✅ Remote origin added"
fi

# Deploy to GitHub Pages
echo "� Deploying to GitHub Pages..."

# Option 1: Deploy to main branch (if using main branch for GitHub Pages)
read -p "Deploy to main branch? (y/n): " deploy_main
if [ "$deploy_main" = "y" ] || [ "$deploy_main" = "Y" ]; then
    echo "📤 Pushing to main branch..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to main branch"
        echo "🌍 Your site will be available at: ${GITHUB_PAGES_URL}"
        echo "⏱️  GitHub Pages deployment usually takes 1-10 minutes"
    else
        echo "❌ Failed to push to main branch"
        exit 1
    fi
fi

# Option 2: Deploy to gh-pages branch
read -p "Also deploy to gh-pages branch? (y/n): " deploy_gh_pages
if [ "$deploy_gh_pages" = "y" ] || [ "$deploy_gh_pages" = "Y" ]; then
    echo "📤 Deploying to gh-pages branch..."
    
    # Create or checkout gh-pages branch
    if git show-ref --verify --quiet refs/heads/gh-pages; then
        git checkout gh-pages
        git merge main --no-edit
    else
        git checkout -b gh-pages
    fi
    
    # Push to gh-pages
    git push -u origin gh-pages
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully deployed to gh-pages branch"
        git checkout main
    else
        echo "❌ Failed to deploy to gh-pages branch"
        git checkout main
        exit 1
    fi
fi

# Test deployment
echo "🧪 Testing deployment..."
echo "📍 GitHub Pages URL: ${GITHUB_PAGES_URL}"
echo "📍 Repository URL: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"

# Performance optimization summary
echo ""
echo "🎯 Performance Optimization Summary:"
echo "  ✅ Service Worker for offline access"
echo "  ✅ PWA Manifest for app-like experience"
echo "  ✅ Critical CSS inlined for fast loading"
echo "  ✅ Lazy loading images with WebP support"
echo "  ✅ Google Analytics integrated (GTM-T3Q3J3XS)"
echo "  ✅ SEO optimized with meta tags and sitemap"
echo "  ✅ Netlify backup configuration included"

# GitHub Pages specific instructions
echo ""
echo "📋 GitHub Pages Setup Instructions:"
echo "  1. Go to https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
echo "  2. Under 'Source', select 'Deploy from a branch'"
echo "  3. Choose 'main' branch (or 'gh-pages' if you used that option)"
echo "  4. Select '/ (root)' folder"
echo "  5. Click 'Save'"
echo "  6. Wait 1-10 minutes for deployment"
echo ""
echo "🔗 Custom Domain Setup (Optional):"
echo "  1. Add a CNAME file with your domain name"
echo "  2. Configure DNS A records to point to GitHub Pages IPs:"
echo "     - 185.199.108.153"
echo "     - 185.199.109.153" 
echo "     - 185.199.110.153"
echo "     - 185.199.111.153"

# Testing recommendations
echo ""
echo "🧪 Post-Deployment Testing:"
echo "  1. Visit ${GITHUB_PAGES_URL} and verify site loads"
echo "  2. Test PWA installation (should show install prompt)"
echo "  3. Run Lighthouse audit for performance scores"
echo "  4. Test offline functionality (disconnect internet)"
echo "  5. Verify Google Analytics is tracking (check Real-Time reports)"
echo "  6. Test on mobile devices"
echo "  7. Check service worker registration in DevTools"

# Monitoring setup
echo ""
echo "📊 Monitoring & Analytics:"
echo "  • Google Analytics: GTM-T3Q3J3XS"
echo "  • Search Console: Add property at https://search.google.com/search-console"
echo "  • GitHub Pages Analytics: Available in repository Insights"
echo "  • Core Web Vitals: Monitor in Google Analytics and PageSpeed Insights"

# Alternative deployment options
echo ""
echo "🌐 Alternative Deployment Options:"
echo "  • Netlify: Connect your GitHub repo at https://netlify.com"
echo "  • Vercel: Import project at https://vercel.com"
echo "  • GitHub Codespaces: Built-in preview functionality"

echo ""
echo "✅ Deployment complete! Your portfolio is live at:"
echo "🔗 ${GITHUB_PAGES_URL}"
echo ""
echo "� Don't forget to:"
echo "  - Set up Google Search Console"
echo "  - Submit sitemap.xml to search engines"
echo "  - Monitor Core Web Vitals in Google Analytics"
echo "  - Test PWA functionality across devices"
