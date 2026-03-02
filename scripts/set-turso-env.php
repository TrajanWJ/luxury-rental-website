<?php
/**
 * One-time script: Adds Turso env vars to the VPS .env file.
 * Upload to public_html/ via FTP, execute via curl, self-deletes.
 *
 * Usage:
 *   curl -s -T scripts/set-turso-env.php \
 *     ftp://209.142.66.121/public_html/set-turso-env.php \
 *     --user 'wilsonprem_trajan:<password>'
 *
 *   curl -s -H "Host: wilson-premier.com" \
 *     http://209.142.66.121/set-turso-env.php
 */
set_time_limit(10);
$envFile = '/home/wilsonprem/wilson-premier-app/.env';
$envContent = file_exists($envFile) ? file_get_contents($envFile) : '';

$added = [];

// ⚠️  FILL IN actual values from .env.local before uploading to VPS
if (strpos($envContent, 'TURSO_DATABASE_URL') === false) {
    $envContent .= "\nTURSO_DATABASE_URL=libsql://wilson-premier-wilsonprem-dev26.aws-us-east-1.turso.io\n";
    $added[] = 'TURSO_DATABASE_URL';
}

if (strpos($envContent, 'TURSO_AUTH_TOKEN') === false) {
    $envContent .= "TURSO_AUTH_TOKEN=PASTE_TOKEN_FROM_ENV_LOCAL_BEFORE_UPLOADING\n";
    $added[] = 'TURSO_AUTH_TOKEN';
}

if (strpos($envContent, 'PERSISTENT_DATA_DIR') === false) {
    $envContent .= "PERSISTENT_DATA_DIR=/home/wilsonprem/data\n";
    $added[] = 'PERSISTENT_DATA_DIR';
}

if (count($added) > 0) {
    file_put_contents($envFile, $envContent);
    echo "Added: " . implode(', ', $added) . "\n";
} else {
    echo "All env vars already present\n";
}

echo "Current .env contents:\n";
echo file_get_contents($envFile);

unlink(__FILE__);
