$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$dist = Join-Path $root "dist"

New-Item -ItemType Directory -Force -Path $dist | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $dist "src") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $dist "public") | Out-Null

Copy-Item -LiteralPath (Join-Path $root "index.html") -Destination (Join-Path $dist "index.html") -Force
Copy-Item -LiteralPath (Join-Path $root "src\main.js") -Destination (Join-Path $dist "src\main.js") -Force
Copy-Item -LiteralPath (Join-Path $root "src\styles.css") -Destination (Join-Path $dist "src\styles.css") -Force
Copy-Item -LiteralPath (Join-Path $root "src\works.js") -Destination (Join-Path $dist "src\works.js") -Force
Copy-Item -LiteralPath (Join-Path $root "src\works.css") -Destination (Join-Path $dist "src\works.css") -Force
Copy-Item -LiteralPath (Join-Path $root "src\sanity-client.js") -Destination (Join-Path $dist "src\sanity-client.js") -Force
Copy-Item -LiteralPath (Join-Path $root "works") -Destination (Join-Path $dist "works") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "public\assets") -Destination (Join-Path $dist "assets") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "public\vendor") -Destination (Join-Path $dist "vendor") -Recurse -Force

Write-Host "Static build ready at $dist"
