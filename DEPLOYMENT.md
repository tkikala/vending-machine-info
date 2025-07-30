# 🚀 Deployment Guide - Vercel

## Prerequisites
- GitHub account with this repository
- Vercel account (free tier)

## 🔧 Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required Variables:
```
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=your-secure-64-character-random-hex-string-here
NODE_ENV=production
PORT=4000
```

**Generate your JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration

### 3. Configure Environment Variables
1. In Vercel Dashboard → Project Settings → Environment Variables
2. Add all the variables listed above
3. Make sure to generate a new JWT_SECRET for production security

### 4. Deploy
- Vercel will automatically deploy on every push to main
- First deployment may take 2-3 minutes

## 🔒 Security Features Enabled

✅ **Rate Limiting**
- Login attempts: 5 per 15 minutes per IP
- API requests: 100 per 15 minutes per IP  
- File uploads: 20 per hour per IP

✅ **Secure Authentication**
- bcrypt password hashing (12 salt rounds)
- Cryptographically secure JWT secret
- Session-based authentication with auto-expiry

✅ **HTTPS**
- Automatic SSL/TLS certificates via Vercel
- Secure cookie transmission

## 🎯 Post-Deployment

### Admin Login
- URL: `https://your-app.vercel.app/login`
- Email: `[Your admin email from seed script]`
- Password: `[Your admin password from seed script]`

### Testing
1. Test login functionality
2. Create a new vending machine
3. Upload logo and gallery images
4. Verify rate limiting works (try >5 login attempts)

## 🔄 Database Considerations

**Current Setup (SQLite):**
- ✅ Perfect for MVP/demo
- ✅ Zero configuration
- ⚠️ Limited to single instance
- ⚠️ File uploads stored in memory (resets on deployment)

**Production Upgrade (Later):**
- Migrate to PostgreSQL (Vercel Postgres addon)
- Use cloud storage for file uploads (Vercel Blob)
- Enable database backups

## 🆘 Troubleshooting

**Build Fails:**
- Check Node.js version compatibility
- Verify all environment variables are set

**Login Issues:**
- Verify JWT_SECRET is set correctly
- Check CORS configuration

**File Uploads Not Working:**
- Files are stored in serverless function memory (temporary)
- Consider upgrading to Vercel Blob storage for persistence

## 🔐 Security Note

**JWT Secret:** 
- Generate a unique 64-character hex string for production
- Never share or commit this secret to your repository
- Anyone with this secret can create valid authentication tokens
- Store it securely in Vercel environment variables only 