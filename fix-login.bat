@echo off
echo ========================================
echo Fix NextAuth Configuration Error
echo ========================================
echo.

echo Step 1: Cleaning cache...
if exist .next (
    rmdir /s /q .next
    echo [OK] Removed .next folder
) else (
    echo [SKIP] .next folder not found
)

echo.
echo Step 2: Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma Client
    echo Please make sure you stopped the dev server first!
    pause
    exit /b 1
)
echo [OK] Prisma Client generated

echo.
echo Step 3: Starting dev server...
echo ========================================
echo You can now login with:
echo   Email: admin@example.com
echo   Password: admin123
echo ========================================
echo.
call npm run dev

