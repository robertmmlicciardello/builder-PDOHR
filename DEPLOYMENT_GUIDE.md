# HR Management System Deployment Guide
# ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ် Deploy လုပ်ခြင်း လမ်းညွှန်

This guide provides detailed instructions for deploying the HR Management System on different hosting platforms.

---

## 🖥️ VPS Server Deployment / VPS Server မှာ Deploy လုပ်ခြင်း

### System Requirements / စနစ် လိုအပ်ချက်များ

- **Operating System:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** Minimum 2GB, Recommended 4GB+
- **Storage:** Minimum 20GB SSD
- **CPU:** 2+ cores recommended
- **Network:** Static IP address preferred
- **Access:** Root or sudo privileges

### 1. Initial Server Setup / ကန ဦး Server ပြင်ဆင်ခြင်း

#### Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### CentOS/RHEL
```bash
# Update system
sudo yum update -y

# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install development tools
sudo yum groupinstall -y "Development Tools"
```

### 2. Install Additional Dependencies / နောက်ထပ် Dependencies များ ထည့်သွင်းခြင်း

```bash
# Install Git
sudo apt install git -y

# Install Nginx web server
sudo apt install nginx -y

# Install PM2 process manager
sudo npm install -g pm2

# Install Firebase CLI (optional)
sudo npm install -g firebase-tools

# Install SSL certificate tool
sudo apt install certbot python3-certbot-nginx -y
```

### 3. Create Application User / Application User ဖန်တီးခြင်း

```bash
# Create dedicated user for the application
sudo adduser hrapp
sudo usermod -aG sudo hrapp

# Switch to application user
sudo su - hrapp

# Create application directory
mkdir /home/hrapp/hr-system
cd /home/hrapp/hr-system
```

### 4. Deploy Application Code / Application Code Deploy လုပ်ခြင်း

```bash
# Clone repository (replace with your repository URL)
git clone https://github.com/your-username/hr-management-system.git .

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
```

#### Environment Configuration
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Production settings
NODE_ENV=production
PORT=3000

# Security settings (optional)
SESSION_SECRET=your_secure_random_string
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 5. Build and Start Application / Application တည်ဆောက်ပြီး စတင်ခြင်း

```bash
# Build the application
npm run build

# Test the build locally
npm run preview

# Start with PM2
pm2 start npm --name "hr-system" -- run start

# Set PM2 to start on system boot
pm2 startup
pm2 save
```

### 6. Configure Nginx Reverse Proxy / Nginx Reverse Proxy ပြင်ဆင်ခြင်း

Create Nginx server block:
```bash
sudo nano /etc/nginx/sites-available/hr-system
```

#### Basic HTTP Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    root /home/hrapp/hr-system/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/hr-system.access.log;
    error_log /var/log/nginx/hr-system.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://firebase.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://firestore.googleapis.com;" always;

    # Main application
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes (if using backend server)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets optimization
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ /(\.env|package\.json|node_modules) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

Enable the site:
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/hr-system /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 7. SSL Certificate Setup / SSL Certificate ပြင်ဆင်ခြင်း

```bash
# Get free SSL certificate from Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Setup automatic renewal
sudo crontab -e
# Add the following line:
0 12 * * * /usr/bin/certbot renew --quiet

# Test SSL configuration
sudo certbot certificates
```

### 8. Firewall Configuration / Firewall ပြင်ဆင်ခြင်း

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### 9. Database Backup and Monitoring / Database Backup နှင့် Monitoring

Create backup script:
```bash
nano /home/hrapp/backup-script.sh
```

```bash
#!/bin/bash
# Firebase backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/hrapp/backups"
PROJECT_ID="your-firebase-project-id"

# Create backup directory
mkdir -p $BACKUP_DIR

# Export Firestore data (requires Firebase CLI)
firebase firestore:delete --all-collections --force --project $PROJECT_ID
gcloud firestore export gs://your-backup-bucket/backups/$DATE --project $PROJECT_ID

# Backup application files
tar -czf $BACKUP_DIR/hr-system-$DATE.tar.gz /home/hrapp/hr-system

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /home/hrapp/backup-script.sh

# Add to crontab for daily backup
sudo crontab -e
# Add: 0 2 * * * /home/hrapp/backup-script.sh
```

---

## 🌐 cPanel Hosting Deployment / cPanel Hosting မှာ Deploy လုပ်ခြင်း

### Prerequisites / လိုအပ်ချက်များ

- Shared hosting with cPanel access
- PHP 7.4+ or Node.js support (preferred)
- At least 1GB storage space
- FTP/File Manager access
- Custom domain or subdomain

### 1. Local Build Preparation / Local Build ပြင်ဆင်ခြင်း

On your development machine:
```bash
# Ensure all dependencies are installed
npm install

# Create production build
npm run build

# The 'dist' folder contains all files needed for deployment
```

### 2. cPanel File Management / cPanel File စီမံခန့်ခွဲခြင်း

#### Method A: Using File Manager

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to public_html**
4. **Create application folder** (e.g., `hr-system`)
5. **Upload and extract files:**
   - Create ZIP of `dist` folder contents
   - Upload ZIP to cPanel
   - Extract in target directory

#### Method B: Using FTP

```bash
# Using command line FTP
ftp your-domain.com
# Enter credentials
# Navigate to public_html
cd public_html/hr-system
# Upload all files from dist folder
mput dist/*
```

#### Method C: Using SFTP/SCP

```bash
# Using SCP
scp -r dist/* username@your-domain.com:~/public_html/hr-system/

# Using rsync
rsync -avz dist/ username@your-domain.com:~/public_html/hr-system/
```

### 3. Domain Configuration / Domain ပြင်ဆင်ခြင်း

#### Option A: Main Domain
- Upload files to `public_html` root
- Access: `https://yourdomain.com`

#### Option B: Subdomain
1. Go to cPanel → **Subdomains**
2. Create subdomain: `hr`
3. Document Root: `public_html/hr-system`
4. Access: `https://hr.yourdomain.com`

#### Option C: Subfolder
- Upload to `public_html/hr-system`
- Access: `https://yourdomain.com/hr-system`

### 4. Configure URL Rewriting / URL Rewriting ပြင်ဆင်ခြင်း

Create `.htaccess` file in your application directory:

```apache
# HR Management System .htaccess Configuration

# Enable rewrite engine
RewriteEngine On

# Set base path (adjust if in subfolder)
RewriteBase /hr-system/

# Handle SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !=/favicon.ico
RewriteRule ^ index.html [L]

# Force HTTPS (if SSL available)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains" env=HTTPS
    
    # CSP for Firebase integration
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://firebase.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://firebase.googleapis.com https://firestore.googleapis.com wss://s-usc1f-nss-2077.firebaseio.com;"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive on
    
    # Cache static assets for 1 year
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType application/x-javascript "access plus 1 year"
    ExpiresByType text/javascript "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    
    # Cache HTML for 1 hour
    ExpiresByType text/html "access plus 1 hour"
    
    # Cache JSON for 1 day
    ExpiresByType application/json "access plus 1 day"
</IfModule>

# File protection
<FilesMatch "\.(env|json|md|log|txt)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Directory protection
Options -Indexes

# Disable server signature
ServerSignature Off

# File size limits (adjust as needed)
LimitRequestBody 10485760  # 10MB
```

### 5. Firebase Configuration / Firebase ပြင်ဆင်ခြင်း

1. **Go to Firebase Console**
2. **Authentication → Settings → Authorized domains**
3. **Add your cPanel domain:**
   - `yourdomain.com`
   - `www.yourdomain.com`
   - `hr.yourdomain.com` (if using subdomain)

### 6. Testing and Verification / Testing နှင့် စစ်ဆေးခြင်း

#### Functional Testing
1. **Open website in browser**
2. **Test core features:**
   - User authentication
   - Personnel management
   - Financial transactions
   - Report generation
   - Language switching

#### Performance Testing
```bash
# Use online tools:
# - Google PageSpeed Insights
# - GTmetrix
# - Pingdom Website Speed Test

# Check browser console for errors
# Verify all resources load correctly
```

#### Security Testing
- SSL certificate validation
- Mixed content warnings
- HTTPS redirection
- Security headers verification

### 7. Maintenance and Updates / ပြုပြင်ထိန်းသိမ်းခြင်းနှင့် အပ်ဒိတ်များ

#### Update Process
1. **Build new version locally**
2. **Backup current files**
3. **Upload new files**
4. **Test functionality**
5. **Clear browser cache**

#### Monitoring
- **Check logs regularly** (cPanel Error Logs)
- **Monitor disk usage**
- **Verify backup procedures**
- **Test SSL certificate renewal**

---

## 🔧 Troubleshooting / ပြဿနာဖြေရှင်းခြင်း

### Common VPS Issues / VPS ပြဿနာများ

#### Application Won't Start
```bash
# Check PM2 status
pm2 status
pm2 logs hr-system

# Check system resources
free -h
df -h

# Check port availability
sudo netstat -tlnp | grep :3000
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/hr-system.error.log
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Manually renew
sudo certbot renew
```

### Common cPanel Issues / cPanel ပြဿနာများ

#### 404 Errors on Page Refresh
```apache
# Add to .htaccess:
FallbackResource /index.html

# Or use:
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### Large File Upload Issues
- **Increase upload limits in cPanel**
- **Compress files before upload**
- **Use File Manager's extraction feature**

#### Performance Issues
- **Enable Gzip compression**
- **Optimize images**
- **Minimize HTTP requests**
- **Use browser caching**

#### Firebase Connection Issues
- **Check authorized domains in Firebase Console**
- **Verify CORS settings**
- **Check CSP headers**
- **Test with different browsers**

---

## 📊 Performance Optimization / စွမ်းဆောင်ရည် မြှင့်တင်ခြင်း

### Frontend Optimization
```bash
# Build with optimization flags
npm run build -- --mode production

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/static/js/*.js
```

### Server Optimization (VPS)
```bash
# Optimize Nginx
sudo nano /etc/nginx/nginx.conf

# Add worker processes optimization:
worker_processes auto;
worker_connections 1024;

# Enable HTTP/2 (with SSL)
listen 443 ssl http2;
```

### Database Optimization
- **Use Firebase indexes** for complex queries
- **Implement pagination** for large datasets
- **Cache frequently accessed data**
- **Use offline persistence** in Firebase

---

## 🔐 Security Best Practices / လုံခြုံရေး အကောင်းဆုံး အလေ့အကျင့်များ

### VPS Security
```bash
# Update system regularly
sudo apt update && sudo apt upgrade

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### cPanel Security
- **Use strong passwords**
- **Enable two-factor authentication**
- **Regular file permission checks**
- **Monitor access logs**
- **Keep cPanel software updated**

### Application Security
- **Regular dependency updates**
- **Environment variable protection**
- **Input validation**
- **XSS protection**
- **CSRF protection**

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Prepared for:** PDF Technology Workshop
