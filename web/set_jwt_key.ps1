$key = Get-Content -Path "jwt_key_dashboard.txt" -Raw
npx convex env set JWT_PRIVATE_KEY $key
