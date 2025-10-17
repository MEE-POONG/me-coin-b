@echo off
echo ========================================
echo Fixing Prisma Client Generation Issues
echo ========================================
echo.

echo Step 1: Cleaning up old Prisma Client...
if exist node_modules\.prisma (
    rmdir /s /q node_modules\.prisma
    echo Deleted node_modules\.prisma
)
if exist node_modules\@prisma\client (
    rmdir /s /q node_modules\@prisma\client
    echo Deleted node_modules\@prisma\client
)

echo.
echo Step 2: Re-generating Prisma Client...
call npx prisma generate

echo.
echo Step 3: Verifying installation...
call npx prisma validate

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo If you still see errors, try:
echo 1. Close VS Code completely
echo 2. Close all terminal windows
echo 3. Run this script again
echo.
pause

