# Quick Fix: Manually Create User in Convex (CORRECTED)

## ⚠️ CRITICAL CORRECTION (26 Jan)
The JWT `sub` claim contains the **User UUID**, not the email address.
The previous instructions used `...|email` which is why it didn't work.

**Target Identifier Format:**
`https://laventecareauthsystems.onrender.com|<USER_UUID>`

## Solution

Run this in your browser console on the dashboard page. It will grab your UUID from the current session token:

```javascript
// Copy-paste this entire block into browser console
(async () => {
  // 1. Get current token and parse it
  const token = localStorage.getItem('laventecare_access_token');
  if (!token) return alert("❌ No token found! Please login first.");
  
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.sub; // This is the UUID!
  console.log("Found User UUID:", userId);

  // 2. Prepare mutation
  const { useMutation } = await import('/node_modules/convex/dist/esm/browser/index.js');
  const { api } = await import('/convex/_generated/api.js');
  
  // 3. Create user with CORRECT identifier
  const createAdmin = window.Convex.client.mutation;
  const identifier = `https://laventecareauthsystems.onrender.com|${userId}`;
  
  console.log("Creating user with identifier:", identifier);
  
  const result = await createAdmin(api.admin.createAdminUser, {
    email: payload.email || "jeffrey@smartcoolcare.nl",
    name: payload.full_name || "Jeffrey",
    tokenIdentifier: identifier
  });
  
  console.log("User created:", result);
  alert(`✅ User synced!\nUUID: ${userId}\nIdentifier: ${identifier}\n\nReload the page!`);
})();
```

## Why it failed before
- JWT `sub`: `172f8e6c-97fa-490f-bf0e-323d012071ca` (UUID)
- We created: `...|jeffrey@smartcoolcare.nl`
- Mismatch! ❌

## Next Steps
After running this script and reloading, `users.store` will work automatically because the identity finally exists.
