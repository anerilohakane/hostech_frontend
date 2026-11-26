Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity\brain\8d75637c-a326-4e58-9999-954b5f27076a\.user_uploaded\media_1795692088026_417d3fd0.jpg"
$baseDir = "c:\HostTech\PGApp\android\app\src\main\res"

# Standard sizes for mipmap launcher icons
$densities = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

# Adaptive foreground sizes (108dp base canvas)
$fgDensities = @{
    "mipmap-mdpi"    = 108
    "mipmap-hdpi"    = 162
    "mipmap-xhdpi"   = 216
    "mipmap-xxhdpi"  = 324
    "mipmap-xxxhdpi" = 432
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$srcW = $srcBmp.Width
$srcH = $srcBmp.Height

# Make near-white pixels transparent so it works as a crisp foreground layer on any background
$transparentBmp = [System.Drawing.Bitmap]::new($srcW, $srcH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$whiteThreshold = 240

for ($y = 0; $y -lt $srcH; $y++) {
    for ($x = 0; $x -lt $srcW; $x++) {
        $c = $srcBmp.GetPixel($x, $y)
        if ($c.R -ge $whiteThreshold -and $c.G -ge $whiteThreshold -and $c.B -ge $whiteThreshold) {
            $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
        } else {
            # Smooth edge alpha transition for anti-aliased look
            $brightness = ($c.R + $c.G + $c.B) / 3.0
            if ($brightness -gt 220) {
                $alpha = [int](255 * (240 - $brightness) / 20.0)
                if ($alpha -lt 0) { $alpha = 0 }
                if ($alpha -gt 255) { $alpha = 255 }
                $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            } else {
                $transparentBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
            }
        }
    }
}

# Find bounding box of non-transparent content
$minX = $srcW; $maxX = 0; $minY = $srcH; $maxY = 0
for ($y = 0; $y -lt $srcH; $y++) {
    for ($x = 0; $x -lt $srcW; $x++) {
        if ($transparentBmp.GetPixel($x, $y).A -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Host "Cropped content bounds: $minX, $minY to $maxX, $maxY ($cropW x $cropH)"

$croppedBmp = [System.Drawing.Bitmap]::new($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gCrop = [System.Drawing.Graphics]::FromImage($croppedBmp)
$gCrop.DrawImage($transparentBmp, [System.Drawing.Rectangle]::new(0, 0, $cropW, $cropH), [System.Drawing.Rectangle]::new($minX, $minY, $cropW, $cropH), [System.Drawing.GraphicsUnit]::Pixel)
$gCrop.Dispose()

foreach ($entry in $densities.GetEnumerator()) {
    $folder = Join-Path $baseDir $entry.Key
    $sz = $entry.Value

    # 1. Square Legacy Icon (with white rounded background)
    $bmp = [System.Drawing.Bitmap]::new($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $r = $sz * 0.20
    $d = $r * 2
    $rect = [System.Drawing.RectangleF]::new(0, 0, $sz, $sz)
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    
    $g.FillPath([System.Drawing.Brushes]::White, $path)

    # Scale logo into 80% of canvas
    $targetW = $sz * 0.82
    $scale = $targetW / $cropW
    $targetH = $cropH * $scale
    if ($targetH -gt ($sz * 0.82)) {
        $targetH = $sz * 0.82
        $scale = $targetH / $cropH
        $targetW = $cropW * $scale
    }
    $destX = ($sz - $targetW) / 2
    $destY = ($sz - $targetH) / 2
    $g.DrawImage($croppedBmp, [System.Drawing.RectangleF]::new($destX, $destY, $targetW, $targetH))

    $outPath = Join-Path $folder "ic_launcher.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()

    # 2. Round Legacy Icon
    $bmpRound = [System.Drawing.Bitmap]::new($sz, $sz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gRound = [System.Drawing.Graphics]::FromImage($bmpRound)
    $gRound.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gRound.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $pathRound = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $pathRound.AddEllipse(0, 0, $sz, $sz)
    $gRound.FillPath([System.Drawing.Brushes]::White, $pathRound)

    # Safe circle area is ~72%
    $targetRoundW = $sz * 0.72
    $scaleRound = $targetRoundW / $cropW
    $targetRoundH = $cropH * $scaleRound
    if ($targetRoundH -gt ($sz * 0.72)) {
        $targetRoundH = $sz * 0.72
        $scaleRound = $targetRoundH / $cropH
        $targetRoundW = $cropW * $scaleRound
    }
    $destRoundX = ($sz - $targetRoundW) / 2
    $destRoundY = ($sz - $targetRoundH) / 2
    $gRound.DrawImage($croppedBmp, [System.Drawing.RectangleF]::new($destRoundX, $destRoundY, $targetRoundW, $targetRoundH))

    $outRoundPath = Join-Path $folder "ic_launcher_round.png"
    $bmpRound.Save($outRoundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gRound.Dispose()
    $bmpRound.Dispose()

    # 3. Adaptive Foreground Icon (Key zone is inner 66dp of 108dp canvas = ~61%)
    $fgSz = $fgDensities[$entry.Key]
    $bmpFg = [System.Drawing.Bitmap]::new($fgSz, $fgSz, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
    $gFg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFg.Clear([System.Drawing.Color]::Transparent)

    $targetFgW = $fgSz * 0.62
    $scaleFg = $targetFgW / $cropW
    $targetFgH = $cropH * $scaleFg
    if ($targetFgH -gt ($fgSz * 0.62)) {
        $targetFgH = $fgSz * 0.62
        $scaleFg = $targetFgH / $cropH
        $targetFgW = $cropW * $scaleFg
    }
    $destFgX = ($fgSz - $targetFgW) / 2
    $destFgY = ($fgSz - $targetFgH) / 2
    $gFg.DrawImage($croppedBmp, [System.Drawing.RectangleF]::new($destFgX, $destFgY, $targetFgW, $targetFgH))

    $outFgPath = Join-Path $folder "ic_launcher_foreground.png"
    $bmpFg.Save($outFgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $gFg.Dispose()
    $bmpFg.Dispose()
}

$croppedBmp.Dispose()
$transparentBmp.Dispose()
$srcBmp.Dispose()

Write-Host "New HostTech launcher icons generated successfully from user image!"
