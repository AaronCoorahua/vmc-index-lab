[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path

$sensitivePaths = @(
  "static-review-20261002\.vercel-auth",
  "static-review-20261002\qa-browser"
)

$profileRoot = Join-Path $workspaceRoot "index\qa"
if (Test-Path -LiteralPath $profileRoot) {
  $sensitivePaths += Get-ChildItem -LiteralPath $profileRoot -Directory -Force |
    Where-Object { $_.Name -match "profile" } |
    ForEach-Object { $_.FullName.Substring($workspaceRoot.Length + 1) }
}

$sensitiveReport = foreach ($relativePath in $sensitivePaths) {
  $absolutePath = Join-Path $workspaceRoot $relativePath
  [PSCustomObject]@{
    Path = $relativePath
    Present = Test-Path -LiteralPath $absolutePath
  }
}

$junctionReport = foreach ($relativePath in @(
  "index\node_modules",
  "index-final-review\node_modules",
  "index-council-review\node_modules"
)) {
  $absolutePath = Join-Path $workspaceRoot $relativePath
  if (Test-Path -LiteralPath $absolutePath) {
    $item = Get-Item -LiteralPath $absolutePath -Force
    [PSCustomObject]@{
      Path = $relativePath
      IsReparsePoint = [bool]($item.Attributes -band [IO.FileAttributes]::ReparsePoint)
      LinkType = [string]$item.LinkType
      Target = ($item.Target -join "; ")
    }
  }
}

$result = [PSCustomObject]@{
  Workspace = $workspaceRoot
  Sensitive = @($sensitiveReport)
  Junctions = @($junctionReport)
  ReadyForGitBaseline = -not [bool]($sensitiveReport | Where-Object Present)
}

$result | ConvertTo-Json -Depth 5

if (-not $result.ReadyForGitBaseline) {
  exit 2
}

