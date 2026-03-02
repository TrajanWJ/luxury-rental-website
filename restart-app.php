<?php
/**
 * Restart the Wilson Premier app via PM2.
 * Upload to public_html/ via FTP, execute via curl, self-deletes.
 *
 * Usage:
 *   curl -s -T restart-app.php ftp://209.142.66.121/public_html/restart-app.php --user 'wilsonprem_trajan:<password>'
 *   curl -s --max-time 25 -H "Host: wilson-premier.com" http://209.142.66.121/restart-app.php
 */
set_time_limit(20);
$pm2 = '/usr/bin/pm2';
$appDir = '/home/wilsonprem/wilson-premier-app';

echo "=== Stopping PM2 process ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 stop all 2>&1") . "\n";

// Kill any orphaned node processes
shell_exec("pkill -9 -f 'next-server' 2>&1");
shell_exec("pkill -9 -f 'node.*server.js' 2>&1");
shell_exec("pkill -9 -f 'node.*app.js' 2>&1");
sleep(3);

echo "=== Starting PM2 process ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 start all 2>&1") . "\n";

sleep(3);

echo "=== PM2 status ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 list 2>&1") . "\n";

echo "=== Saving PM2 config ===\n";
echo shell_exec("HOME=/home/wilsonprem $pm2 save 2>&1") . "\n";

unlink(__FILE__);
