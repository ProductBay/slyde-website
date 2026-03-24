param(
  [switch]$Dev
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $root ".logs"
$pidFile = Join-Path $logsDir "slyde-fixed.pid"
$metaFile = Join-Path $logsDir "slyde-fixed.json"
$port = 4007
$mode = if ($Dev) { "dev:fixed" } else { "start:fixed" }
$logFile = Join-Path $logsDir ($(if ($Dev) { "slyde-fixed-dev.log" } else { "slyde-fixed.log" }))

New-Item -ItemType Directory -Force $logsDir | Out-Null

if (Test-Path $pidFile) {
  $existingPid = [int](Get-Content $pidFile | Select-Object -First 1)
  $existingProcess = Get-Process -Id $existingPid -ErrorAction SilentlyContinue
  if ($existingProcess) {
    Stop-Process -Id $existingPid -Force
    Start-Sleep -Seconds 2
  }
}

$listener = $null
try {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
  $listener.Start()
} catch {
  throw "Port $port is already in use by another process. Stop that process or change the fixed SLYDE port."
} finally {
  if ($listener) {
    $listener.Stop()
  }
}

$cmdLine = "npm run $mode > `"$logFile`" 2>&1"
$process = Start-Process -FilePath "cmd.exe" -WorkingDirectory $root -ArgumentList @("/c", $cmdLine) -WindowStyle Hidden -PassThru

$started = $false
$listenerProcessId = $null
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 2
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
      $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($connection) {
        $listenerProcessId = $connection.OwningProcess
      }
      $started = $true
      break
    }
  } catch {
  }
}

if (-not $started) {
  throw "SLYDE failed to start on http://localhost:$port. Check $logFile"
}

$resolvedProcessId = if ($listenerProcessId) { $listenerProcessId } else { $process.Id }

Set-Content -Path $pidFile -Value $resolvedProcessId
Set-Content -Path $metaFile -Value (@{
  pid = $resolvedProcessId
  wrapperPid = $process.Id
  port = $port
  mode = $mode
  log = $logFile
  startedAt = (Get-Date).ToString("o")
} | ConvertTo-Json)

Write-Output "SLYDE started on http://localhost:$port"
Write-Output "PID=$resolvedProcessId"
Write-Output "LOG=$logFile"
