$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$flows = @(
  ".\maxrun\workflows\01_status_reconcile.md",
  ".\maxrun\workflows\02_simulation_workflow.md",
  ".\maxrun\workflows\03_design_space_workflow.md",
  ".\maxrun\workflows\04_metrics_deliverables_workflow.md",
  ".\maxrun\workflows\05_final_integration_review.md"
)

foreach ($flow in $flows) {
  if (-not (Test-Path $flow)) {
    throw "Workflow file not found: $flow"
  }

  Write-Host ""
  Write-Host "=== Running $flow ===" -ForegroundColor Cyan
  $prompt = Get-Content -Raw $flow
  & codex.cmd exec --cd $root $prompt
}

Write-Host ""
Write-Host "=== Done. Review plan.md changes with: git diff -- plan.md ===" -ForegroundColor Green
