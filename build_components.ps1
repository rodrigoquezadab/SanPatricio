$menuHtml = Get-Content -Raw -Path (Join-Path $PSScriptRoot "components/menu.html") -Encoding utf8
$footerHtml = Get-Content -Raw -Path (Join-Path $PSScriptRoot "components/footer.html") -Encoding utf8

$files = Get-ChildItem -Path $PSScriptRoot -Filter *.html | Where-Object { $_.Name -notlike "generated_*" }

foreach ($file in $files) {
    $content = Get-Content -Raw -Path $file.FullName -Encoding utf8
    
    # Replace menu
    if ($content -match '(?s)<div id="menu-container">\s*<\/div>') {
        $content = [regex]::Replace($content, '(?s)<div id="menu-container">\s*<\/div>', ('<div id="menu-container">' + "`n" + $menuHtml + "`n" + '</div>'))
    } elseif ($content -match '<nav class="bg-verdeSanPatricio') {
        $content = [regex]::Replace($content, '(?s)<div id="menu-container">.*?<\/nav>\s*<\/div>', ('<div id="menu-container">' + "`n" + $menuHtml + "`n" + '</div>'))
    }
    
    # Replace footer
    if ($content -match '(?s)<div id="footer-container">\s*<\/div>') {
        $content = [regex]::Replace($content, '(?s)<div id="footer-container">\s*<\/div>', ('<div id="footer-container">' + "`n" + $footerHtml + "`n" + '</div>'))
    } elseif ($content -match '<footer class="bg-gray-800') {
        $content = [regex]::Replace($content, '(?s)<div id="footer-container">.*?<\/footer>\s*<\/div>', ('<div id="footer-container">' + "`n" + $footerHtml + "`n" + '</div>'))
    }
    
    # Clean up paths just in case
    $content = $content.Replace('../assets/', 'assets/')
    $content = $content.Replace('../noticias.json', 'noticias.json')
    $content = $content.Replace('../components.js', 'components.js')
    
    # Write back to file
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Processed $($file.Name)"
}
Write-Host "Build completed!"
