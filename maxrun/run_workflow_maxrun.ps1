param(
  [int]$Runs = 1
)

$ErrorActionPreference = "Stop"
$OutputEncoding = New-Object System.Text.UTF8Encoding $false
[Console]::OutputEncoding = $OutputEncoding

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$workflow = Join-Path $root "workflow.md"
if (-not (Test-Path $workflow)) {
  throw "Workflow file not found: $workflow"
}

if (-not (Get-Command codex.cmd -ErrorAction SilentlyContinue)) {
  throw "codex.cmd was not found on PATH."
}

if ($Runs -lt 1) {
  throw "Runs must be at least 1."
}

for ($i = 1; $i -le $Runs; $i++) {
  Write-Host ""
  Write-Host "=== Running workflow.md run $i of $Runs ===" -ForegroundColor Cyan
  Get-Content -Raw -Encoding UTF8 $workflow | codex.cmd exec --cd $root -

  if ($LASTEXITCODE -ne 0) {
    throw "codex.cmd exec failed on run $i with exit code $LASTEXITCODE."
  }
}

Write-Host ""
Write-Host "=== Done. Review changes with: git diff -- workflow.md 2stage-bjt.md progress.md netlists results ===" -ForegroundColor Green
