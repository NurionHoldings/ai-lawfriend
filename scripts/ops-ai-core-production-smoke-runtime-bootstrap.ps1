param(
    [switch]$ConfirmProduction
)

$ErrorActionPreference = "Stop"

if (-not $ConfirmProduction) {
    throw "-ConfirmProduction is required."
}

$repoPath = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$previousSecret = [Environment]::GetEnvironmentVariable(
    "OPS_SMOKE_BOOTSTRAP_SECRET",
    "Process"
)
$secretPointer = [IntPtr]::Zero
$promptedForSecret = [string]::IsNullOrWhiteSpace($previousSecret)

try {
    if ($promptedForSecret) {
        $secureSecret = Read-Host `
            "OPS_SMOKE_BOOTSTRAP_SECRET 입력 (화면과 명령 기록에 표시되지 않음)" `
            -AsSecureString
        $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
            $secureSecret
        )
        $plainSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR(
            $secretPointer
        )
        [Environment]::SetEnvironmentVariable(
            "OPS_SMOKE_BOOTSTRAP_SECRET",
            $plainSecret,
            "Process"
        )
        $plainSecret = $null
    }

    Push-Location $repoPath
    try {
        & npm.cmd run ops:ai-core-production-smoke-runtime-bootstrap -- `
            --confirm-production
        if ($LASTEXITCODE -ne 0) {
            throw "Production runtime bootstrap helper failed."
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    if ($promptedForSecret) {
        [Environment]::SetEnvironmentVariable(
            "OPS_SMOKE_BOOTSTRAP_SECRET",
            $previousSecret,
            "Process"
        )
    }
    if ($secretPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
    }
    $secureSecret = $null
    $plainSecret = $null
}
