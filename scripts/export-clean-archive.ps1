param(
  [string]$Output = "AI법친-clean.zip"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$targetPath = Join-Path $root $Output

$excludePatterns = @(
  "^\.env$",
  "^\.env\.local$",
  "^\.env\..+\.local$",
  "^\.git/",
  "^\.next/",
  "^node_modules/",
  "^prisma/dev\.db$",
  "^coverage/",
  "^playwright-report/",
  "^test-results/",
  "\.log$"
)

function Is-Excluded([string]$relativePath) {
  foreach ($pattern in $excludePatterns) {
    if ($relativePath -match $pattern) {
      return $true
    }
  }
  return $false
}

if (Test-Path $targetPath) {
  Remove-Item $targetPath -Force
}

$allFiles = Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
  $fullPath = $_.FullName
  $relative = [System.IO.Path]::GetRelativePath($root, $fullPath).Replace('\\', '/')
  [PSCustomObject]@{
    FullPath = $fullPath
    Relative = $relative
  }
}

$included = $allFiles | Where-Object { -not (Is-Excluded $_.Relative) }

if ($included.Count -eq 0) {
  throw "압축 대상 파일이 없습니다."
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($targetPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $included) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip,
      $file.FullPath,
      $file.Relative,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
finally {
  $zip.Dispose()
}

Write-Host "[export:clean-archive] PASS"
Write-Host "output=$targetPath"
Write-Host "fileCount=$($included.Count)"
