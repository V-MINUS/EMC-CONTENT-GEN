# Script to create .env.local file with OpenAI API key
param(
    [Parameter(Mandatory=$true)]
    [string]$OpenAIKey
)

$envContent = @"
OPENAI_API_KEY=$OpenAIKey
USE_MOCK_SERVICES=false
"@

# Create .env.local file
Set-Content -Path ".\.env.local" -Value $envContent

Write-Host "Created .env.local file with your OpenAI API key" -ForegroundColor Green
Write-Host "To activate real OpenAI integration, restart your dev server with: npm run dev" -ForegroundColor Cyan
