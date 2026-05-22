param(
  [int]$Runs = 1,
  [string]$Workflow = "workflow.md"
)

$ErrorActionPreference = "Stop"
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $OutputEncoding

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$workflowPath = if ([System.IO.Path]::IsPathRooted($Workflow)) {
  $Workflow
} else {
  Join-Path $root $Workflow
}

if (-not (Test-Path $workflowPath)) {
  throw "Workflow file not found: $workflowPath"
}

if (-not (Get-Command codex.cmd -ErrorAction SilentlyContinue)) {
  throw "codex.cmd was not found on PATH."
}

if ($Runs -lt 1) {
  throw "Runs must be at least 1."
}

for ($i = 1; $i -le $Runs; $i++) {
  Write-Host ""
  Write-Host "=== Running $Workflow run $i of $Runs ===" -ForegroundColor Cyan
  Get-Content -Raw -Encoding UTF8 $workflowPath | codex.cmd exec --cd $root -

  if ($LASTEXITCODE -ne 0) {
    throw "codex.cmd exec failed on run $i with exit code $LASTEXITCODE."
  }
}

Write-Host ""
Write-Host "=== Done. Review changes with: git diff -- workflow.md 2stage-bjt.md progress.md netlists results ===" -ForegroundColor Green
