# Adds a brief HTML file to the website and rebuilds the index.
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools\add-brief.ps1 -Source "C:\path\brief.html" -Date 2026-10-01 -Slot morning
# Slot: morning | afternoon | weekend
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][ValidatePattern('^\d{4}-\d{2}-\d{2}$')][string]$Date,
    [Parameter(Mandatory = $true)][ValidateSet('morning', 'afternoon', 'weekend')][string]$Slot
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)

$html = [IO.File]::ReadAllText((Resolve-Path $Source), $utf8)
# The website never shows the WhatsApp copy/share box (Kelly's request, 2026-10-01).
$html = [regex]::Replace($html, '(?s)<!--\s*WHATSAPP.*?-->\s*', '')
$html = [regex]::Replace($html, '(?s)<div class="wa-s">.*?class="copy-hint".*?</p>\s*</div>\s*', '')
$html = [regex]::Replace($html, '(?s)(?://[^\n]*waZh[^\n]*\n)?const waZh.*?(?=function setL)', '')
$html = [regex]::Replace($html, '(?m)^\.(?:wa-s|wa-tabs|wt|wb|wa-actions|bc|bc-select|copy-hint)\b[^\n]*\n', '')
$tag = '<script src="../assets/brief-bar.js?v=2" defer></script>'
if ($html -notmatch [regex]::Escape('assets/brief-bar.js')) {
    if ($html -match '</body>') { $html = $html -replace '</body>', "$tag`n</body>" } else { $html += "`n$tag`n" }
}
$dest = Join-Path $root "briefs\$Date-$Slot.html"
[IO.File]::WriteAllText($dest, $html, $utf8)
Write-Host "Added $dest"

& (Join-Path $PSScriptRoot 'build-index.ps1')
