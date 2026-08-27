@echo off
cd /d "%~dp0"
set "NODE_EXE=%~dp0runtime\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
"%NODE_EXE%" --version >nul 2>nul
if errorlevel 1 (
  echo PeopleFlow runtime is missing. Please extract the complete package again.
  pause
  exit /b 1
)
if not exist "out\index.html" (
  echo PeopleFlow website files are missing. Please extract the complete package again.
  pause
  exit /b 1
)
if not exist "PeopleFlow-Data" mkdir "PeopleFlow-Data"
start "" "http://localhost:3210/preview"
echo PeopleFlow Workspace is running at http://localhost:3210/preview
echo Keep this window open while using PeopleFlow.
"%NODE_EXE%" local\server.mjs
pause
