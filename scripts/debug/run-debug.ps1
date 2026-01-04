# PowerShell script to run debug-live-courses.ts

Write-Host "🔍 Running Live Courses Debug Script..." -ForegroundColor Cyan
Write-Host ""

# Compile and run TypeScript
npx ts-node scripts/debug/debug-live-courses.ts
