Quick workaround om user handmatig te synken:

1. Open browser console
2. Run dit commando:

```javascript
// In de browser console
const api = window.Convex.api;
const client = window.Convex.client;

// Manually trigger user sync
client.mutation(api.users.store).then(() => {
  console.log("User synced!");
  location.reload();
});
```

OF: 

Voeg deze button toe in je Dashboard component:

```tsx
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

function SyncButton() {
  const storeUser = useMutation(api.users.store);
  
  return (
    <button onClick={() => storeUser().then(() => alert('Synced!')).catch(e => alert('Error: ' + e))}>
      Sync User to Convex
    </button>
  );
}
```

Het echte probleem is waarschijnlijk dat `convexAuth` false is omdat Convex's eigen auth check faalt.

Check de console logs - als je `[useAuthSync] State: { isAuthenticated: true, hasUser: true, convexAuth: false }` ziet, dan is dat het probleem.
