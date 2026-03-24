$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $root ".logs"
$pidFile = Join-Path $logsDir "slyde-fixed.pid"
$metaFile = Join-Path $logsDir "slyde-fixed.json"

if (-not (Test-Path $pidFile)) {
  Write-Output "SLYDE is not running."
  exit 0
}

$meta = if (Test-Path $metaFile) { Get-Content $metaFile | ConvertFrom-Json } else { $null }
$port = if ($meta) { [int]$meta.port } else { 4007 }
$connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
$processId = if ($connection) { $connection.OwningProcess } else { [int](Get-Content $pidFile | Select-Object -First 1) }
$process = Get-Process -Id $processId -ErrorAction SilentlyContinue

if (-not $process) {
  Write-Output "SLYDE PID file exists but process $processId is not running."
  exit 1
}

Write-Output "SLYDE is running."
Write-Output "PID=$processId"
if ($meta) {
  Write-Output "PORT=$($meta.port)"
  Write-Output "MODE=$($meta.mode)"
  Write-Output "LOG=$($meta.log)"
  Write-Output "STARTED_AT=$($meta.startedAt)"
}
