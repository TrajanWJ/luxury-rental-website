# sPanel VPS Setup — Claude Browser Extension Prompt

> Copy everything below this line and paste it into the Claude extension while you're on the sPanel page.

---

I need you to help me configure this sPanel VPS to host a Next.js website. I'll navigate to each section and you'll tell me exactly what to fill in. We have multiple tasks to complete in order. Guide me through each one step by step — tell me what to click, what to type, and confirm each step before moving on.

## Context

- **Domain:** wilson-premier.com
- **VPS IP:** 209.142.66.121
- **sPanel URL:** https://209.142.66.121/spanel/
- **sPanel credentials:** user: `wilsonprem_dev26` / pass: `uBDp57whTdeE8`
- **Purpose:** Host a Next.js 16 application (Node.js) with a MariaDB database
- **Current state:** The VPS currently runs a WordPress site. We are replacing it with a Next.js app.

---

## TASK 1: Create the MariaDB Database

Navigate to: **Homepage → Databases section → MySQL Databases**

Create a new database with these EXACT values:
- **Database name:** `wilsonprem_admin`

Then create a database user:
- **Username:** `wilsonprem_app`
- **IP/Hostname:** `localhost` (since the app will run on this same server, we use localhost NOT `%`)
- **Password:** Generate a strong password using the built-in generator (32+ characters). **IMPORTANT: Copy this password and save it somewhere — I will need it later.**
- **Check the box:** "Grant the user access to the database"
- Click **Submit**

After creation, confirm:
- The database `wilsonprem_admin` appears in the database list
- The user `wilsonprem_app` is associated with it

Tell me the exact password that was generated.

---

## TASK 2: Enable SSH Access

Navigate to: **Admin Interface → Left sidebar → Accounts Management → Manage SSH Access**

(If this is the User Interface and not the Admin Interface, look for a way to switch. There may be an "Admin Area" link, or the SSH toggle might be under **Tools** section.)

- Find the account `wilsonprem_dev26` in the list
- **Enable the SSH toggle switch** for this account
- Confirm SSH access is now enabled

If SSH Access management is not available or you can't find it:
- Check under **Tools** section on the homepage
- Check under **Security** section
- Search for "SSH" using the sPanel search bar
- Tell me what you see so I can help you find it

---

## TASK 3: Open the SSH Terminal (Browser-Based)

Navigate to: **Homepage → Tools section → SSH Terminal**

(This is a built-in browser-based command line — no external software needed.)

If the terminal opens successfully, run these commands one at a time and tell me the output of each:

### 3a. Check Node.js availability
```
node --version
```

### 3b. Check npm availability
```
npm --version
```

### 3c. Check if PM2 is installed
```
pm2 --version 2>/dev/null || echo "PM2 not installed"
```

### 3d. Check the web server
```
nginx -v 2>/dev/null || apache2 -v 2>/dev/null || httpd -v 2>/dev/null
```

### 3e. Check the document root and current files
```
ls -la ~/public_html/
```

### 3f. Check MariaDB is running
```
mysql --version && mysql -u wilsonprem_app -p'PASSWORD_FROM_TASK_1' wilsonprem_admin -e "SELECT 1 as test;"
```
(Replace `PASSWORD_FROM_TASK_1` with the actual password from Task 1)

### 3g. Check available disk space
```
df -h /home/
```

### 3h. Check OS and kernel
```
cat /etc/os-release | head -4 && uname -r
```

Tell me the output of ALL of these commands. I need to understand the server environment before proceeding.

---

## TASK 4: Check the Node.js Manager

Navigate to: **Homepage → Software section → Node.js Manager** (or **NodeJS Manager**)

If this tool exists:
- Tell me what you see — is there a "Deploy a New App" button?
- What Node.js versions are available?
- Is there already an app deployed?
- What fields does the deployment form have? (app name, root directory, entry point, port, etc.)

If this tool does NOT exist:
- Tell me so — we'll install Node.js manually via the SSH terminal instead.

---

## TASK 5: Install Node.js (if not already installed)

**Skip this if Node.js was already available in Task 3a.**

### Option A: Via Node.js Manager (preferred)
If the Node.js Manager exists, use it to install/enable Node.js. Select the latest LTS version (v20 or v22).

### Option B: Via SSH Terminal
If no Node.js Manager, go back to the SSH Terminal and run:

```bash
# Check if nvm or node is available system-wide
which node || which nodejs

# If nothing found, install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
npm --version
```

Then install PM2 globally:
```bash
npm install -g pm2
pm2 --version
```

---

## TASK 6: Set Up the Project Directory

In the SSH Terminal, run these commands:

```bash
# Create a directory for the Next.js app (separate from WordPress)
mkdir -p ~/wilson-premier-app

# Create a directory for uploaded media files (photo uploads from admin dashboard)
mkdir -p ~/public_html/media/photos
chmod 755 ~/public_html/media/photos
```

Confirm both directories were created.

---

## TASK 7: Create the Database Tables

In the SSH Terminal, run this command (replace PASSWORD with the password from Task 1):

```bash
mysql -u wilsonprem_app -p'PASSWORD_FROM_TASK_1' wilsonprem_admin << 'SQL'
CREATE TABLE IF NOT EXISTS photo_orders (
  property_slug VARCHAR(100) PRIMARY KEY,
  order_data JSON NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trash_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  property_slug VARCHAR(100) NOT NULL,
  src VARCHAR(500) NOT NULL,
  deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_property (property_slug),
  INDEX idx_deleted_at (deleted_at)
);

SHOW TABLES;
SQL
```

Confirm that both `photo_orders` and `trash_items` tables were created.

---

## TASK 8: Set Up the PHP Upload Endpoint

In the SSH Terminal, run this command to create a simple file upload endpoint:

```bash
cat > ~/public_html/media/upload.php << 'PHPEOF'
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: X-Upload-Secret, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$SECRET = 'WP_UPLOAD_2026_xK9mR4vL7nQ2pY8w';

$auth = $_SERVER['HTTP_X_UPLOAD_SECRET'] ?? '';
if ($auth !== $SECRET) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$property = $_POST['property'] ?? '';
if (!$property || !preg_match('/^[a-z0-9-]+$/', $property)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid property slug']);
    exit;
}

$uploadDir = __DIR__ . '/photos/' . $property . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$urls = [];
foreach ($_FILES['files']['tmp_name'] as $i => $tmp) {
    if (!is_uploaded_file($tmp)) continue;
    $ext = strtolower(pathinfo($_FILES['files']['name'][$i], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'avif'])) continue;
    $filename = time() . '-' . $i . '.' . $ext;
    $dest = $uploadDir . $filename;
    if (move_uploaded_file($tmp, $dest)) {
        $urls[] = '/media/photos/' . $property . '/' . $filename;
    }
}

echo json_encode(['ok' => true, 'urls' => $urls]);
PHPEOF

chmod 644 ~/public_html/media/upload.php
echo "Upload endpoint created at /media/upload.php"
```

Then test it:
```bash
ls -la ~/public_html/media/upload.php
```

---

## TASK 9: Configure Nginx/Apache for the Next.js App

First, let's figure out what web server is running. In the SSH Terminal:

```bash
# Check which web server is active
systemctl status nginx 2>/dev/null | head -5
systemctl status apache2 2>/dev/null | head -5
systemctl status httpd 2>/dev/null | head -5

# Check existing server config
ls /etc/nginx/sites-available/ 2>/dev/null || ls /etc/nginx/conf.d/ 2>/dev/null
ls /etc/apache2/sites-available/ 2>/dev/null || ls /etc/httpd/conf.d/ 2>/dev/null

# Check what's listening on port 80/443
ss -tlnp | grep -E ':80|:443'
```

**Tell me ALL the output.** The web server configuration depends on whether it's nginx or Apache, and I need to see the current setup before we write the config.

The goal is:
- The Next.js app runs on a local port (e.g., 3000)
- The web server reverse-proxies incoming HTTP/HTTPS traffic to port 3000
- The `/media/` path serves static files directly from `~/public_html/media/` (for photo uploads)
- The WordPress site will be replaced

---

## TASK 10: Check Firewall Status

In the SSH Terminal:

```bash
# Check if CSF firewall is installed
csf -v 2>/dev/null || echo "CSF not found"

# Check iptables rules
sudo iptables -L -n 2>/dev/null | head -20 || iptables -L -n 2>/dev/null | head -20

# Check if UFW is active
sudo ufw status 2>/dev/null || ufw status 2>/dev/null
```

Tell me the output. We need to make sure ports 80 and 443 are open (they should be since the WordPress site works), and port 3000 is accessible locally for the Node.js app.

---

## TASK 11: Set Up FTP Access (for deploying the built app)

Navigate back to sPanel: **Homepage → Files section → FTP Accounts**

Create a new FTP account:
- **Username:** `deploy`
- **Password:** Generate a strong one and **save it**
- **Document root:** `/home/wilsonprem_dev26/wilson-premier-app` (restrict to just the app directory)

Confirm the FTP account was created and tell me the password.

---

## SUMMARY OF INFORMATION I NEED

After completing all tasks, give me a summary with:

1. ✅ or ❌ for each task
2. The **MySQL password** from Task 1
3. The **FTP password** from Task 11
4. The **Node.js version** installed
5. The **web server type** (nginx or Apache) and its config location
6. Any errors or issues encountered
7. The output from Task 9 (web server config) — this is critical for the next step

---

## WHAT HAPPENS NEXT

Once these tasks are done, I (the developer) will:
1. Build the Next.js app locally
2. Upload it to the VPS via FTP (to `~/wilson-premier-app/`)
3. Configure PM2 to run the app
4. Set up the web server reverse proxy
5. Update Cloudflare DNS to point wilson-premier.com to this VPS
6. The site goes live

These sPanel tasks are the groundwork that only need to happen once.
