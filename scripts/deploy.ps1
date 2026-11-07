#Requires -Version 5.1
<#
.SYNOPSIS
  Build and deploy envenox to Cloudflare Workers static assets.

.DESCRIPTION
  One command for the whole release. It runs the strict pre-deploy guards, does
  a clean production build, refuses to upload an obviously broken bundle, then
  deploys and PROVES the live site answers before reporting success.

  WHY THIS SCRIPT EXISTS AT ALL
  The deploy had four separate ways to go wrong, and three of them are silent:

  1. STALE ENVIRONMENT VARIABLES POINT AT THE WRONG CLOUDFLARE ACCOUNT.
     CF_API_TOKEN and CF_ACCOUNT_ID are set on this machine and belong to a
     different account (7ed0cc1b...). Wrangler reads them in preference to
     nothing, so a deploy run without clearing them targets the wrong place and
     reports success. They are removed from the process environment below, every
     run, which is the load-bearing line in this file.

  2. THE TOKEN LIVES IN .secrets/ AND MUST NOT LEAK. It is read straight into an
     environment variable and never echoed, never written to a log, and cleared
     again in the finally block. .secrets/ is gitignored; keep it that way.

  3. A DEPLOY TO THE NAME "envenox" REPLACES THE LIVE SITE IMMEDIATELY.
     envenox.com is attached SERVER-SIDE to that Worker name, so no config file
     in this repo can protect it. That is why -Target production demands an
     explicit -Yes, and why staging deploys to a different name entirely.

  4. "wrangler deploy succeeded" DOES NOT MEAN THE SITE WORKS. On 2026-11-06 a
     deploy succeeded and took envenox.com down for hours. Every run therefore
     fetches the live origin afterwards and checks the status code and the HTML.

.PARAMETER Target
  production -> name "envenox", serves envenox.com. Requires -Yes.
  staging    -> name "envenox-next", its own workers.dev URL. Safe to run freely.

.PARAMETER Yes
  Required for -Target production. A guard against replacing the live site by
  reflex. It is not a prompt, so this script can never hang a pipeline.

.PARAMETER SkipChecks
  Skip npm run check:deploy (icons, motion/colour contract, placeholders,
  typecheck). Use only when the checks were just run.

.PARAMETER SkipBuild
  Deploy whatever is already in out/. Use only when out/ was just built from
  the code you intend to ship.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Target staging

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Target production -Yes
#>
[CmdletBinding()]
param(
  [ValidateSet('production', 'staging')]
  [string]$Target = 'production',
  [switch]$Yes,
  [switch]$SkipChecks,
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

# The account every deploy must land in. Hard-coded on purpose: the whole point
# of this script is that the environment cannot be trusted to supply it.
$AccountId = '01e31f4fe3b3891a62a2bee09b76285f'

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Write-Step { param([string]$Text) Write-Host "`n==> $Text" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Text) Write-Host "    OK  $Text" -ForegroundColor Green }
function Write-Warn { param([string]$Text) Write-Host "    !!  $Text" -ForegroundColor Yellow }

function Assert-LastExit {
  param([string]$What)
  if ($LASTEXITCODE -ne 0) { throw "$What failed with exit code $LASTEXITCODE" }
}

if ($Target -eq 'production') {
  $ConfigFile = 'wrangler.jsonc'
  $WorkerName = 'envenox'
  $VerifyUrls = @('https://envenox.com/', 'https://envenox.com/approach')
} else {
  $ConfigFile = 'wrangler.static.jsonc'
  $WorkerName = 'envenox-next'
  $VerifyUrls = @('https://envenox-next.saidurrahman-cs02-01e.workers.dev/')
}

Write-Host ""
Write-Host "  envenox deploy" -ForegroundColor White
Write-Host "  target : $Target  (worker name: $WorkerName)"
Write-Host "  config : $ConfigFile"
Write-Host "  root   : $RepoRoot"

if ($Target -eq 'production' -and -not $Yes) {
  Write-Host ""
  Write-Host "  REFUSING TO DEPLOY." -ForegroundColor Red
  Write-Host "  envenox.com is attached to the Worker name '$WorkerName', so this would"
  Write-Host "  replace the live site for every visitor, immediately."
  Write-Host ""
  Write-Host "  Deploy to staging first:" -ForegroundColor Yellow
  Write-Host "    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Target staging"
  Write-Host ""
  Write-Host "  Or confirm you mean production by adding -Yes:" -ForegroundColor Yellow
  Write-Host "    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy.ps1 -Target production -Yes"
  Write-Host ""
  exit 2
}

try {
  # --- 1. credentials -------------------------------------------------------
  Write-Step 'Credentials'

  $SecretsFile = Join-Path $RepoRoot '.secrets\cloudflare.md'
  if (-not (Test-Path $SecretsFile)) {
    throw "No .secrets\cloudflare.md. The API token lives there and is not in the repo."
  }

  # The token is the one line that is nothing but token characters.
  $match = Select-String -Path $SecretsFile -Pattern '^[A-Za-z0-9_-]{30,}$' | Select-Object -First 1
  if (-not $match) {
    throw "No API token line found in .secrets\cloudflare.md (expected one line of 30+ token characters)."
  }
  $token = $match.Matches[0].Value

  # THE LOAD-BEARING LINES. These two variables are set on this machine and
  # point at a DIFFERENT Cloudflare account; wrangler prefers them, so leaving
  # them in place deploys somewhere else and still prints success.
  Remove-Item Env:\CF_API_TOKEN  -ErrorAction SilentlyContinue
  Remove-Item Env:\CF_ACCOUNT_ID -ErrorAction SilentlyContinue

  $env:CLOUDFLARE_API_TOKEN  = $token
  $env:CLOUDFLARE_ACCOUNT_ID = $AccountId
  Write-Ok "token loaded from .secrets (not shown), account $AccountId"
  Write-Ok "cleared stale CF_API_TOKEN / CF_ACCOUNT_ID from this process"

  # --- 2. guards ------------------------------------------------------------
  if ($SkipChecks) {
    Write-Step 'Pre-deploy checks: SKIPPED (-SkipChecks)'
    Write-Warn 'icons, motion/colour contract, placeholders and typecheck were not run'
  } else {
    Write-Step 'Pre-deploy checks (icons, motion, placeholders, typecheck)'
    npm run check:deploy
    Assert-LastExit 'npm run check:deploy'
    Write-Ok 'all guards passed'
  }

  # --- 3. build -------------------------------------------------------------
  if ($SkipBuild) {
    Write-Step 'Build: SKIPPED (-SkipBuild), deploying whatever is in out/'
  } else {
    Write-Step 'Building static export'
    npx next build
    Assert-LastExit 'next build'
    node scripts/post-export.mjs
    Assert-LastExit 'post-export'
    Write-Ok 'build complete'
  }

  # --- 4. refuse to upload a broken bundle ---------------------------------
  # Cheap structural assertions. A deploy is hard to take back, and an empty or
  # truncated out/ is the one failure that is both easy to cause and invisible
  # until visitors hit it.
  Write-Step 'Verifying the bundle before upload'

  $index = Join-Path $RepoRoot 'out\index.html'
  if (-not (Test-Path $index)) { throw "out\index.html does not exist. Nothing to deploy." }

  $indexSize = (Get-Item $index).Length
  if ($indexSize -lt 20000) {
    throw "out\index.html is only $indexSize bytes, which is far too small for this homepage. Refusing to deploy."
  }

  $html = Get-Content $index -Raw
  foreach ($marker in @('We build the', 'Envenox')) {
    if ($html -notmatch [regex]::Escape($marker)) {
      throw "out\index.html does not contain '$marker'. The build looks wrong. Refusing to deploy."
    }
  }

  $pageCount = (Get-ChildItem -Path (Join-Path $RepoRoot 'out') -Filter *.html -Recurse).Count
  if ($pageCount -lt 50) {
    throw "Only $pageCount HTML pages in out/. Expected 100+. Refusing to deploy a partial build."
  }

  if (Test-Path (Join-Path $RepoRoot 'out\styleguide.html')) {
    throw "out\styleguide.html is still present. post-export.mjs did not run. Refusing to deploy a dev-only page."
  }

  Write-Ok "index.html $indexSize bytes, $pageCount HTML pages, no dev-only pages"

  # --- 5. deploy ------------------------------------------------------------
  Write-Step "Deploying to Cloudflare ($WorkerName)"
  npx wrangler deploy -c $ConfigFile
  Assert-LastExit 'wrangler deploy'
  Write-Ok 'wrangler reported success'

  # --- 6. prove the live site actually answers ------------------------------
  # "wrangler deploy succeeded" is not evidence. On 2026-11-06 it succeeded and
  # the site was down for hours, because the Worker was being killed on every
  # request. Only a real request to the real origin settles it.
  Write-Step 'Verifying the live site'
  Start-Sleep -Seconds 4

  $failures = @()
  foreach ($url in $VerifyUrls) {
    try {
      $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30 -MaximumRedirection 5
      if ($res.StatusCode -ne 200) {
        $failures += "$url returned HTTP $($res.StatusCode)"
      } elseif ($res.Content -notmatch 'Envenox') {
        $failures += "$url returned 200 but the HTML does not mention Envenox"
      } else {
        Write-Ok "$url -> 200, $($res.Content.Length) bytes"
      }
    } catch {
      $failures += "$url -> $($_.Exception.Message)"
    }
  }

  if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "  DEPLOY UPLOADED BUT THE SITE DID NOT VERIFY:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "  Roll back in the Cloudflare dashboard:" -ForegroundColor Yellow
    Write-Host "    Workers & Pages -> $WorkerName -> Deployments -> previous version -> Rollback"
    throw "Live verification failed."
  }

  Write-Host ""
  Write-Host "  DONE. $Target is live and answering." -ForegroundColor Green
  foreach ($url in $VerifyUrls) { Write-Host "    $url" }
  Write-Host ""
}
finally {
  # Never leave the token sitting in the environment of a shell the user keeps
  # using afterwards.
  Remove-Item Env:\CLOUDFLARE_API_TOKEN  -ErrorAction SilentlyContinue
  Remove-Item Env:\CLOUDFLARE_ACCOUNT_ID -ErrorAction SilentlyContinue
}
