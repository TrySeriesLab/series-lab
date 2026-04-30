# Series Lab 🎬
### AI-Powered Episode Series Generator

---

## 🚀 How to Deploy in 5 Steps

### Step 1 — Create a GitHub Account (if you don't have one)
1. Go to **github.com**
2. Click "Sign up" and create a free account

---

### Step 2 — Upload this project to GitHub
1. Go to **github.com/new** to create a new repository
2. Name it `series-lab`
3. Keep it **Private**
4. Click "Create repository"
5. Click "uploading an existing file"
6. Drag and drop ALL the files from this folder
7. Click "Commit changes"

---

### Step 3 — Deploy to Vercel
1. Go to **vercel.com** and sign up with your GitHub account
2. Click "Add New Project"
3. Select your `series-lab` repository
4. Click "Deploy" — Vercel auto-detects the setup

---

### Step 4 — Add your SECRET API Key to Vercel
⚠️ This is the most important step — it keeps your key safe!

1. In Vercel, go to your project → **Settings → Environment Variables**
2. Click "Add New"
3. Name: `ANTHROPIC_API_KEY`
4. Value: (paste your Anthropic API key here — starts with sk-ant-)
5. Click "Save"
6. Go to **Deployments** → click the 3 dots → **Redeploy**

---

### Step 5 — Connect your domain (tryserieslab.com)
1. In Vercel → your project → **Settings → Domains**
2. Type `tryserieslab.com` and click "Add"
3. Vercel will show you DNS records to add
4. Go to **Namecheap → your domain → Advanced DNS**
5. Add the records Vercel shows you
6. Wait up to 24 hours — then your site is LIVE! 🎉

---

## 📁 Project Structure
```
series-lab/
├── public/
│   └── index.html        ← Your website (frontend)
├── api/
│   └── generate.js       ← Backend API (hides your API key)
├── vercel.json           ← Vercel configuration
├── package.json          ← Project info
└── README.md             ← This file
```

---

## 🔒 Security
- Your Anthropic API key is stored as an **Environment Variable** in Vercel
- It is NEVER exposed in the frontend code
- Users cannot see or steal your key

---

## 💰 Pricing Plans
| Plan | Price | Episodes |
|------|-------|----------|
| Starter | $19/mo | 12 |
| Creator | $39/mo | 25 |
| Pro | $69/mo | 50 |
| Agency | $149/mo | 120 |
| Studio | $299/mo | 250 |

---

## 🆘 Need Help?
Come back to Claude and say "I need help with Series Lab deployment" and share where you're stuck!
