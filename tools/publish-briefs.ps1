# Commits and pushes ONLY changes under briefs/, insights/ and markets/ (used by the scheduled brief tasks).
# Usage: powershell -ExecutionPolicy Bypass -File tools\publish-briefs.ps1 -Message "Add 2026-10-01 morning brief"
param([string]$Message = "Update briefs")
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

# Find git: PATH first, then the copy bundled with GitHub Desktop (folder name changes on every Desktop update)
$git = (Get-Command git -ErrorAction SilentlyContinue).Source
if (-not $git) {
    $app = Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop" -Directory -Filter 'app-*' -ErrorAction SilentlyContinue |
        Sort-Object { [version]($_.Name -replace '^app-', '') } -Descending | Select-Object -First 1
    if ($app) { $git = Join-Path $app.FullName 'resources\app\git\cmd\git.exe' }
}
if (-not $git -or -not (Test-Path $git)) { Write-Host "RESULT: NO-GIT - upload briefs/, insights/ and markets/ manually"; exit 0 }

Set-Location $root
if (-not (& $git remote)) { Write-Host "RESULT: NO-REMOTE - publish the repository in GitHub Desktop first"; exit 0 }

& $git add -- briefs insights markets
& $git diff --cached --quiet -- briefs insights markets
if ($LASTEXITCODE -eq 0) { Write-Host "RESULT: NOTHING-TO-PUSH"; exit 0 }
& $git commit -q -m $Message -- briefs insights markets
if ($LASTEXITCODE -ne 0) { Write-Host "RESULT: COMMIT-FAILED"; exit 1 }

# Never pop up a login window during an unattended run
$env:GCM_INTERACTIVE = 'never'
$env:GIT_TERMINAL_PROMPT = '0'
& $git push -q origin HEAD
if ($LASTEXITCODE -ne 0) { Write-Host "RESULT: PUSH-FAILED - committed locally; open GitHub Desktop and click Push origin"; exit 1 }
Write-Host "RESULT: PUSHED"
