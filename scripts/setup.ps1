# PowerShell setup script for Windows

Write-Host "🚀 Setting up Spur AI Live Chat..." -ForegroundColor Cyan

# Check Node.js version
$nodeVersion = node -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# Check for .env file
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env and add your OPENAI_API_KEY" -ForegroundColor Yellow
}

# Check for frontend .env file
if (-not (Test-Path frontend/.env)) {
    Write-Host "📝 Creating frontend/.env file..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:3000/api" | Out-File -FilePath frontend/.env -Encoding utf8
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env and add your OPENAI_API_KEY"
Write-Host "2. Run 'npm run dev' to start the application"
Write-Host "3. Open http://localhost:5173 in your browser"



