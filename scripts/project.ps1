param([ValidateSet('install','dev','build','test','typecheck','test:browser','test:extension')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if ($pnpmCommand) { $pnpmPath = $pnpmCommand.Source }
else {
    $pnpmPath = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
    if (-not (Test-Path -LiteralPath $pnpmPath)) { throw 'Install Node.js 22.12+ and pnpm, then run pnpm install.' }
}
Push-Location $projectRoot
try {
    if ($Task -eq 'install') { & $pnpmPath install --frozen-lockfile }
    else { & $pnpmPath run $Task }
    if ($LASTEXITCODE -ne 0) { throw "Project command failed with exit code $LASTEXITCODE." }
} finally { Pop-Location }
