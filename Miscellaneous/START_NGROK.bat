@echo off
echo Starting ngrok tunnel to localhost:3001...
echo.
echo Make sure your backend is running on port 3001 first!
echo.
ngrok http 3001
pause



