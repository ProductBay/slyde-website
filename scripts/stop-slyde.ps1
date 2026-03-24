$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $root ".logs"
$pidFile = Join-Path $logsDir "slyde-fixed.pid"
$metaFile = Join-Path $logsDir "slyde-fixed.json"

if (-not (Test-Path $pidFile)) {
  Write-Output "No SLYDE PID file found."
  exit 0
}

$meta = if (Test-Path $metaFile) { Get-Content $metaFile | ConvertFrom-Json } else { $null }
$port = if ($meta) { [int]$meta.port } else { 4007 }
$connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
$processId = if ($connection) { $connection.OwningProcess } else { [int](Get-Content $pidFile | Select-Object -First 1) }
$process = Get-Process -Id $processId -ErrorAction SilentlyContinue

if ($process) {
  Stop-Process -Id $processId -Force
  Write-Output "Stopped SLYDE process $processId."
} else {
  Write-Output "SLYDE process $processId was not running."
}

Remove-Item $pidFile -ErrorAction SilentlyContinue
Remove-Item $metaFile -ErrorAction SilentlyContinue
