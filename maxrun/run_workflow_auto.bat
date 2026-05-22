@echo off
setlocal

cd /d "%~dp0.."

set RUNS=%~1
if "%RUNS%"=="" set RUNS=1

echo.
echo === Codex 3-stage BJT workflow automation ===
echo Workspace: %CD%
echo Runs: %RUNS%
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
powershell -ExecutionPolicy Bypass -File ".\maxrun\run_workflow_maxrun.ps1" -Runs %RUNS%

echo.
echo Finished. Review changes with:
echo   git diff -- workflow.md 3stage-bjt.md progress.md netlists results
echo.
pause
