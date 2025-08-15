$installDir = "$env:USERPROFILE\\PortableNode\\nodejs"
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
$zipUrl = 'https://nodejs.org/dist/v22.18.0/node-v22.18.0-win-x64.zip'
$zipPath = "$installDir\\node-v22.18.0-win-x64.zip"
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
$extracted = "$installDir\\node-v22.18.0-win-x64"
if (Test-Path $extracted) {
  Move-Item "$extracted\\*" $installDir -Force
  Remove-Item -Path "$extracted" -Recurse -Force
}
Remove-Item -Path $zipPath -Force
$envPath = [Environment]::GetEnvironmentVariable('PATH','User')
# Ensure PATH includes the portable node dir
if ($envPath -notmatch 'PortableNode\\\\nodejs') {
  [Environment]::SetEnvironmentVariable('PATH', $envPath + ';' + $installDir, 'User')
}
node -v
npm -v
