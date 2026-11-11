$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$npm = Get-Command npm.cmd -CommandType Application -ErrorAction Stop

Push-Location -LiteralPath $repoRoot
try {
    & $npm.Source test
    if ($LASTEXITCODE -ne 0) { throw '核心检查失败；未继续构建。' }

    & $npm.Source run build
    if ($LASTEXITCODE -ne 0) { throw '构建失败，请检查上述输出。' }

    Write-Output '核心检查通过，4 个运行网页已更新到仓库 Demo 目录。'
} finally {
    Pop-Location
}
