# Script to apply the optimized versions of our files

# Stop on any error
$ErrorActionPreference = "Stop"

# Display startup message
Write-Host "Applying optimizations to EMC Content Generator..." -ForegroundColor Cyan

# Create a backup of original files
$backupFolder = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -Path ".\$backupFolder" -ItemType Directory -Force | Out-Null

Write-Host "Creating backup in .\$backupFolder..." -ForegroundColor Yellow

# Backup original files
if (Test-Path ".\app\api\generate\route.ts") {
    Copy-Item -Path ".\app\api\generate\route.ts" -Destination ".\$backupFolder\route.ts.bak"
}

if (Test-Path ".\app\components\EnhancedContentForm.tsx") {
    Copy-Item -Path ".\app\components\EnhancedContentForm.tsx" -Destination ".\$backupFolder\EnhancedContentForm.tsx.bak"
}

if (Test-Path ".\app\components\ContentRefiner.tsx") {
    Copy-Item -Path ".\app\components\ContentRefiner.tsx" -Destination ".\$backupFolder\ContentRefiner.tsx.bak"
}

if (Test-Path ".\app\page.tsx") {
    Copy-Item -Path ".\app\page.tsx" -Destination ".\$backupFolder\page.tsx.bak"
}

# Copy optimized files to their destinations
Write-Host "Applying optimized files..." -ForegroundColor Green

# API route
Copy-Item -Path ".\app\api\generate\route.optimized.ts" -Destination ".\app\api\generate\route.ts" -Force

# UI Components
Copy-Item -Path ".\app\components\EnhancedContentForm.optimized.tsx" -Destination ".\app\components\EnhancedContentForm.tsx" -Force
Copy-Item -Path ".\app\components\ContentRefiner.optimized.tsx" -Destination ".\app\components\ContentRefiner.tsx" -Force

# Enhanced page with optimized imports
Copy-Item -Path ".\app\page.enhanced.tsx" -Destination ".\app\page.tsx" -Force

Write-Host "Optimizations applied successfully!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to test the optimized application." -ForegroundColor Cyan
