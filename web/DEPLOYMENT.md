# Deployment Instructions

## 1. Generate Deploy Key

Genereer een secure random key voor authenticatie tussen Go en Convex:

```bash
openssl rand -base64 32
```

Of gebruik deze in Go:
```bash
cd LaventeCareAuthSystems
go run -c 'import ("crypto/rand"; "encoding/base64"; "fmt"); b := make([]byte, 32); rand.Read(b); fmt.Println(base64.StdEncoding.EncodeToString(b))'
```

Of gebruik PowerShell:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 2. Set Environment Variables

### Convex (Dashboard)
1. Ga naar https://dashboard.convex.dev
2. Select project: `koelkastv2`
3. Settings → Environment Variables → Production
4. Add: `CONVEX_DEPLOY_KEY` = (generated key from step 1)

### Go Backend (Render)
1. Ga naar Render Dashboard
2. Select: `LaventeCareAuthSystems`
3. Environment → Environment Variables
4. Add: 
   - `CONVEX_WEBHOOK_URL` = `https://dynamic-schnauzer-274.convex.site/api/gatekeeper/ingest`  
   - `CONVEX_DEPLOY_KEY` = (same key as Convex)

## 3. Deploy

### Convex
```bash
cd KoelkastProjectV2/web
npx convex deploy --prod
```

### Go Backend
```bash
cd LaventeCareAuthSystems
git add .
git commit -m "feat: add Convex integration"
git push origin main
```

Render will auto-deploy.

## 4. Verify

Watch logs on both platforms:
- **Render**: Real-time logs tab
- **Convex**: Dashboard → Logs

Trigger telemetry from ESP32 and check:
1. Go logs show: `[IoT] Telemetry from Koelkast_X (tenant: ...)`
2. Convex logs show: `[Gatekeeper] Telemetry from Koelkast_X`
3. Data appears in Convex database
