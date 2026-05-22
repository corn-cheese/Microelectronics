@echo off
setlocal

cd /d "%~dp0.."

echo.
echo === Codex plan maxrun automation ===
echo Workspace: %CD%
echo.

where codex.cmd >nul 2>nul
if errorlevel 1 (
  echo ERROR: codex.cmd was not found on PATH.
  echo Install or fix Codex CLI PATH first.
  pause
  exit /b 1
)

echo Checking Codex CLI auth...
codex.cmd doctor
if errorlevel 1 (
  echo.
  echo Codex doctor reported a problem.
  echo If auth failed, run:
  echo   codex.cmd login
  echo.
  pause
  exit /b 1
)

echo.
echo Starting workflow runs...
powershell -ExecutionPolicy Bypass -File ".\maxrun\run_plan_maxrun.ps1"

echo.
echo Finished. Review changes with:
echo   git diff -- plan.md
echo.
pause
