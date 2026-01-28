# Tenant Isolation - Environment Setup Guide

## 🎯 Quick Start

To enable tenant-based authentication in your Astro frontend, configure the following environment variables.

---

## Development Setup (Localhost)

**File**: `web/.env.local` (create if doesn't exist)

```bash
# LaventeCare Auth Backend URL
PUBLIC_AUTH_API_URL=https://laventecareauthsystems.onrender.com

# Development Tenant Override
# This UUID allows testing on localhost without subdomain configuration
# Get your tenant ID from the backend CLI:
# go run cmd/control/main.go create-tenant --name "Dev Tenant" --slug dev-tenant
PUBLIC_DEV_TENANT_ID=your-tenant-uuid-here
PUBLIC_DEV_TENANT_SLUG=dev-tenant
```

### Getting Your Tenant ID

#### Option 1: Backend CLI (Recommended)
```bash
# Navigate to your LaventeCare backend directory
cd path/to/LaventeCare-backend

# Create a new tenant (if you don't have one)
go run cmd/control/main.go create-tenant \
  --name "My Development Tenant" \
  --slug my-dev-tenant

# Output will include the UUID - copy this to PUBLIC_DEV_TENANT_ID
```

#### Option 2: API Call
```bash
# If tenant already exists, fetch it
curl https://laventecareauthsystems.onrender.com/api/v1/tenants/your-slug

# Response includes "id" field - copy this UUID
```

---

## Production Setup (Subdomain-based)

**File**: `.env.production` OR configure in hosting platform (Vercel/Netlify/etc.)

```bash
# LaventeCare Auth Backend URL
PUBLIC_AUTH_API_URL=https://laventecareauthsystems.onrender.com

# DO NOT set PUBLIC_DEV_TENANT_ID in production
# Tenant resolution happens automatically from subdomain
```

### Subdomain Configuration

Your production deployment should use custom domains:
- ✅ `bakkerij-jansen.laventecare.nl`
- ✅ `cafe-de-kroon.laventecare.nl`
- ❌ `laventecare.nl/tenant/bakkerij-jansen` (not supported)

Configure DNS:
```
CNAME bakkerij-jansen  your-hosting-provider.com
CNAME cafe-de-kroon    your-hosting-provider.com
```

---

## Testing Subdomain Resolution Locally

### Windows
Edit: `C:\Windows\System32\drivers\etc\hosts` (requires Administrator)

```hosts
127.0.0.1  tenant-a.localhost
127.0.0.1  tenant-b.localhost
```

### Mac / Linux
Edit: `/etc/hosts` (requires sudo)

```bash
sudo nano /etc/hosts
```

Add:
```hosts
127.0.0.1  tenant-a.localhost
127.0.0.1  tenant-b.localhost
```

### Start Dev Server
```bash
cd web
npm run dev -- --host
```

Visit: `http://tenant-a.localhost:4321`

---

## Troubleshooting

### "Tenant context not available" on localhost
**Fix**: Verify `.env.local` exists and contains `PUBLIC_DEV_TENANT_ID`

```bash
# Check file exists
ls web/.env.local

# Show contents
cat web/.env.local

# Restart dev server after adding variables
```

### "Failed to resolve tenant: 400 Bad Request"
**Fix**: The tenant slug doesn't exist in backend

```bash
# Check if tenant exists
curl https://laventecareauthsystems.onrender.com/api/v1/tenants/your-slug

# Create if missing
go run cmd/control/main.go create-tenant --name "Tenant Name" --slug your-slug
```

### Subdomain not resolving locally
**Fix**: Verify hosts file AND dev server started with `--host` flag

```bash
# Ping to verify hosts file
ping tenant-a.localhost

# Should resolve to 127.0.0.1

# Start server correctly
npm run dev -- --host  # Note the --host flag
```

---

## Environment Variable Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `PUBLIC_AUTH_API_URL` | ✅ Production<br>⚠️ Dev (has fallback) | `https://laventecareauthsystems.onrender.com` | LaventeCare backend URL |
| `PUBLIC_DEV_TENANT_ID` | ❌ Production<br>⚠️ Dev (recommended) | None | Localhost tenant override UUID |
| `PUBLIC_DEV_TENANT_SLUG` | ❌ All | `dev-tenant` | Localhost tenant slug (cosmetic) |

---

**Setup Complete!** 🎉

Now test by:
1. Starting dev server: `npm run dev`
2. Opening browser: `http://localhost:4321`
3. Checking console: Should see `[TenantResolver] Using development tenant override`
4. Navigating to `/login` and submitting credentials
