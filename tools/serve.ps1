# Tiny local web server for previewing the site: http://localhost:8080
# Usage: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 [-Port 8080]
param([int]$Port = 8080)
$root = Split-Path -Parent $PSScriptRoot
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8';
            '.json' = 'application/json'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.svg' = 'image/svg+xml';
            '.ico' = 'image/x-icon'; '.webp' = 'image/webp' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"
try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $res = $ctx.Response
        try {
            $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
            if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
            $file = [IO.Path]::GetFullPath((Join-Path $root $path))
            if ($file.StartsWith($root) -and (Test-Path $file -PathType Leaf)) {
                $bytes = [IO.File]::ReadAllBytes($file)
                $ext = [IO.Path]::GetExtension($file).ToLower()
                $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
                $res.Headers.Add('Cache-Control', 'no-store')
                if ($ctx.Request.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($bytes, 0, $bytes.Length) }
            } else {
                $res.StatusCode = 404
            }
        } catch {
            Write-Host "Error serving $($ctx.Request.Url): $_"
        } finally {
            try { $res.Close() } catch {}
        }
    }
} finally { $listener.Stop() }
