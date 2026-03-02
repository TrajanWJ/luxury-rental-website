<?php
set_time_limit(120);
$appDir = '/home/wilsonprem/wilson-premier-app';
$dataDir = '/home/wilsonprem/data';

// Create persistent data directory
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
    echo "Created $dataDir\n";
}

// Extract the new deploy FIRST (so seed files are available)
$zip = "$appDir/wilson-premier-deploy.zip";
if (file_exists($zip)) {
    $za = new ZipArchive();
    if ($za->open($zip) === TRUE) {
        $za->extractTo($appDir);
        $za->close();
        echo "Extracted deploy zip\n";
        unlink($zip);
    } else {
        echo "ERROR: Failed to open zip\n";
    }
} else {
    echo "WARNING: No zip found at $zip\n";
}

// Seed data files only if they don't already exist (AFTER extraction)
foreach (['photo-orders.json', 'site-config.json'] as $file) {
    $persistent = "$dataDir/$file";
    $seed = "$appDir/data/$file";
    if (!file_exists($persistent) && file_exists($seed)) {
        copy($seed, $persistent);
        echo "Seeded $file to persistent location\n";
    } else if (file_exists($persistent)) {
        echo "$file already exists — keeping it\n";
    }
}

echo "Done. Restart the app now.\n";
unlink(__FILE__);
