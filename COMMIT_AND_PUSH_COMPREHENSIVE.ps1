# Comprehensive Git Commit and Push Script
# Run this script to commit all changes and push to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive Git Commit and Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Show current status
Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 2: Add all modified files
Write-Host "Step 2: Adding all modified files..." -ForegroundColor Yellow
git add -A
Write-Host "✓ All files staged" -ForegroundColor Green
Write-Host ""

# Step 3: Show what will be committed
Write-Host "Step 3: Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Step 4: Create comprehensive commit message
Write-Host "Step 4: Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
Optimize dish recommendations API and update documentation

API Optimizations:
- Remove vintageAge from wineAnalysis output (calculated server-side)
- Remove tanninCharacter from wineAnalysis.structure output
- Remove confidence objects from dish recommendations output
- Update mockDishData.json to match optimized format
- Filter fields in both mock and live modes for consistency

Documentation Updates:
- Update Master Chef V1.1 Enhanced prompt spec with optimizations
- Document field removal and token savings (~490-640 tokens, 12-15% reduction)

Backend Changes:
- server.js: Add filtering logic for optimized output
- mockDishData.json: Remove fields no longer in API response
- Database storage still captures complete data when available

This reduces API payload size while maintaining full data capture in database.
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit created successfully" -ForegroundColor Green
    Write-Host ""
    
    # Step 5: Push to GitHub
    Write-Host "Step 5: Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✓ SUCCESS: All changes pushed to GitHub" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Check Render dashboard for automatic deployment" -ForegroundColor White
        Write-Host "2. Or manually trigger deployment in Render if needed" -ForegroundColor White
        Write-Host "3. Test API endpoints to verify optimized responses" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✗ Error: Push failed" -ForegroundColor Red
        Write-Host "Check the error message above" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✗ Error: Commit failed" -ForegroundColor Red
    Write-Host "Check the error message above" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "- No changes to commit (all files already committed)" -ForegroundColor White
    Write-Host "- Merge conflicts that need to be resolved" -ForegroundColor White
}

