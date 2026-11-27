param(
    [switch]$PruneObsolete
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repoRoot "apps\backend\EDGE.Api\EDGE.Api.csproj"
$templatesDir = Join-Path $repoRoot "apps\backend\EDGE.Infrastructure\Printing\Templates"
$tempOut = Join-Path $repoRoot "apps\backend\bin\r2-template-sync"

Write-Host "Building EDGE.Api into temporary sync output..."
dotnet build $apiProject --no-restore -p:UseSharedCompilation=false -m:1 -o $tempOut
if ($LASTEXITCODE -ne 0) {
    throw "EDGE.Api build failed with exit code $LASTEXITCODE"
}

try {
    $dllPath = Join-Path $tempOut "EDGE.Api.dll"
    $cliArgs = @($dllPath, "--environment", "Development", "--sync-templates", "--dir", $templatesDir)
    if ($PruneObsolete) {
        $cliArgs += "--prune-obsolete"
    }

    dotnet @cliArgs
    if ($LASTEXITCODE -ne 0) {
        throw "R2 template sync failed with exit code $LASTEXITCODE"
    }
}
finally {
    if (Test-Path $tempOut) {
        Remove-Item -Recurse -Force $tempOut -ErrorAction SilentlyContinue
    }
}
