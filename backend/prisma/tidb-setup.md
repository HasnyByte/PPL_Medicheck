# TiDB Cloud Setup (Alternative to PostgreSQL)

If using TiDB Cloud instead of local PostgreSQL:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
}
```

2. Update `backend/.env`:
```
DATABASE_URL="mysql://user:password@gateway.tidbcloud.com:4000/medicheck?ssl-mode=VERIFY_IDENTITY&ssl-ca=...path/to/ca.pem"
```

3. Run:
```bash
cd backend
npx prisma generate
npx prisma db push
node src/seed.js
```

Note: TiDB is MySQL-compatible. Set `TIDB_SSL=true` in backend-ai/.env if connecting from Python too.
