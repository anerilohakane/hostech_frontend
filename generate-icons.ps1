Add-Type -AssemblyName System.Drawing

$densities = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$fgDensities = @{
    "mipmap-mdpi"    = 108
    "mipmap-hdpi"    = 162
    "mipmap-xhdpi"   = 216
    "mipmap-xxhdpi"  = 324
    "mipmap-xxxhdpi" = 432
}

$baseDir = "c:\HostTech\PGApp\android\app\src\main\res"

# Color definitions
$tealColor = [System.Drawing.ColorTranslator]::FromHtml("#326D75")
$whiteBrush = [System.Drawing.Brushes]::White
$goldBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml("#F2C982"))

function Draw-HouseIcon ($g, $cx, $cy, $scale) {
    # Draw house silhouette in white
    $pts = @(
        [System.Drawing.PointF]::new($cx, $cy - (24 * $scale)),
        [System.Drawing.PointF]::new($cx - (24 * $scale), $cy - (4 * $scale)),
        [System.Drawing.PointF]::new($cx - (19 * $scale), $cy),
        [System.Drawing.PointF]::new($cx - (14 * $scale), $cy - (4 * $scale)),
        [System.Drawing.PointF]::new($cx - (14 * $scale), $cy + (24 * $scale)),
        [System.Drawing.PointF]::new($cx - (4 * $scale), $cy + (24 * $scale)),
        [System.Drawing.PointF]::new($cx - (4 * $scale), $cy + (8 * $scale)),
        [System.Drawing.PointF]::new($cx + (4 * $scale), $cy + (8 * $scale)),
        [System.Drawing.PointF]::new($cx + (4 * $scale), $cy + (24 * $scale)),
        [System.Drawing.PointF]::new($cx + (14 * $scale), $cy + (24 * $scale)),
        [System.Drawing.PointF]::new($cx + (14 * $scale), $cy - (4 * $scale)),
        [System.Drawing.PointF]::new($cx + (19 * $scale), $cy),
        [System.Drawing.PointF]::new($cx + (24 * $scale), $cy - (4 * $scale))
    )
    $g.FillPolygon($whiteBrush, $pts)

    # Draw Tech Star/Sparkle in Gold
    $starPts = @(
        [System.Drawing.PointF]::new($cx, $cy - (12 * $scale)),
        [System.Drawing.PointF]::new($cx + (3 * $scale), $cy - (4 * $scale)),
        [System.Drawing.PointF]::new($cx + (10 * $scale), $cy - (2 * $scale)),
        [System.Drawing.PointF]::new($cx + (3 * $scale), $cy),
        [System.Drawing.PointF]::new($cx, $cy + (8 * $scale)),
        [System.Drawing.PointF]::new($cx - (3 * $scale), $cy),
        [System.Drawing.PointF]::new($cx - (10 * $scale), $cy - (2 * $scale)),
        [System.Drawing.PointF]::new($cx - (3 * $scale), $cy - (4 * $scale))
    )
    $g.FillPolygon($goldBrush, $starPts)
}

foreach ($entry in $densities.GetEnumerator()) {
    $folder = Join-Path $baseDir $entry.Key
    $sz = $entry.Value

    # 1. Square Launcher with rounded corners
    $bmp = [System.Drawing.Bitmap]::new($sz, $sz)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Background rounded rect
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $r = $sz * 0.22
    $d = $r * 2
    $rect = [System.Drawing.RectangleF]::new(0, 0, $sz, $sz)
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    
    $bgBrush = [System.Drawing.SolidBrush]::new($tealColor)
    $g.FillPath($bgBrush, $path)
    
    Draw-HouseIcon $g ($sz / 2) ($sz / 2) ($sz / 80.0)
    
    $outPath = Join-Path $folder "ic_launcher.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()

    # 2. Round Launcher
    $bmpRound = [System.Drawing.Bitmap]::new($sz, $sz)
    $gRound = [System.Drawing.Graphics]::FromImage($bmpRound)
    $gRound.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    
    $pathRound = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $pathRound.AddEllipse(0, 0, $sz, $sz)
    $gRound.FillPath($bgBrush, $pathRound)
    
    Draw-HouseIcon $gRound ($sz / 2) ($sz / 2) ($sz / 80.0)
    
    $outRoundPath = Join-Path $folder "ic_launcher_round.png"
    $bmpRound.Save($outRoundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gRound.Dispose()
    $bmpRound.Dispose()

    # 3. Foreground Icon (108dp base)
    $fgSz = $fgDensities[$entry.Key]
    $bmpFg = [System.Drawing.Bitmap]::new($fgSz, $fgSz)
    $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
    $gFg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gFg.Clear([System.Drawing.Color]::Transparent)
    
    Draw-HouseIcon $gFg ($fgSz / 2) ($fgSz / 2) ($fgSz / 150.0)
    
    $outFgPath = Join-Path $folder "ic_launcher_foreground.png"
    $bmpFg.Save($outFgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gFg.Dispose()
    $bmpFg.Dispose()
    $bgBrush.Dispose()
}

$goldBrush.Dispose()
Write-Host "All launcher icons generated successfully!"
