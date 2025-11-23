@echo off
echo ========================================
echo MeCoins MongoDB Setup Script
echo ========================================
echo.

REM ตรวจสอบว่ามี .env หรือไม่
if not exist .env (
    echo [1/5] Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo ** IMPORTANT **
    echo Please edit .env file and set your MongoDB connection string:
    echo DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/mecoins?retryWrites=true&w=majority"
    echo.
    echo Or for local MongoDB:
    echo DATABASE_URL="mongodb://localhost:27017/mecoins"
    echo.
    pause
) else (
    echo [1/5] .env file already exists
)

echo.
echo [2/5] Installing dependencies...
call npm install

echo.
echo [3/5] Generating Prisma Client...
call npx prisma generate

echo.
echo [4/5] Pushing schema to MongoDB...
call npx prisma db push

echo.
echo [5/5] Seeding database...
call npx prisma db seed

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo You can now run:
echo   npm run dev       - Start development server
echo   npx prisma studio - Open Prisma Studio
echo.
pause

