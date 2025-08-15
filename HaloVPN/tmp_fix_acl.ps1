# PowerShell ACL fix script
$paths = @(
  "C:\\LeapVPN\\leapvpn\\HaloVPN\\gradle\\wrapper\\dists\\gradle-7.4-all\\gradle-7.4",
  "C:\\LeapVPN\\leapvpn\\HaloVPN\\gradle\\wrapper\\dists\\gradle-7.4-all"
)
foreach ($p in $paths) {
  if (Test-Path $p) {
    icacls "$p" /grant "$($env:USERNAME):(F)" /T
  } else {
    Write-Output "Path not found: $p"
  }
}
