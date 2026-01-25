# Quick Fix: Manually Create User in Convex

## Problem
Convex's `ctx.auth.getUserIdentity()` returns `null` even though JWT is present. This prevents the `users.store` mutation from working.

## Solution
Run this in your browser console on the dashboard page:

```javascript
// Copy-paste this entire block into browser console
(async () => {
  // Get Convex client from window
  const { useMutation } = await import('/node_modules/convex/dist/esm/browser/index.js');
  const { api } = await import('/convex/_generated/api.js');
  
  // Create mutation callable
  const createAdmin = window.Convex.client.mutation;
  
  // Call the mutation
  const result = await createAdmin(api.admin.createAdminUser, {
    email: "jeffrey@smartcoolcare.nl",
    name: "Jeffrey",
    tokenIdentifier: "https://laventecareauthsystems.onrender.com|jeffrey@smartcoolcare.nl"
  });
  
  console.log("User created:", result);
  alert("User created! Reload the page to see devices.");
})();
```

## Alternative: Via Convex Dashboard

1. Open https://dashboard.convex.dev
2. Go to Data → users table
3. Click "Add Document"
4. Paste:
```json
{
  "email": "jeffrey@smartcoolcare.nl",
  "name": "Jeffrey",
  "role": "admin",
  "tokenIdentifier": "https://laventecareauthsystems.onrender.com|jeffrey@smartcoolcare.nl",
  "createdAt": 1737935000000
}
```
5. Save
6. Reload dashboard - devices should appear!

## Why This Works
- Bypasses the broken `ctx.auth.getUserIdentity()` check
- Creates user directly in database
- `getLiveSensors` query checks for admin role → returns all devices

## Next Steps
After you see devices, we can debug why JWT validation fails in Convex.
