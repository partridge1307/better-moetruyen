## Hướng dẫn config

```bash
# Tạo file .env và config giống như trong .env.example

npm install

#Tạo database
# Database production
npx prisma db push # Push mọi thay đổi trong prisma.schema đến database. Có thể bị mất dữ liệu
# or
yarn prisma db push

# Database develop
npx prisma migrate dev # Để develop database
# or
yarn prisma migrate dev

npx prisma generate # Tạo prisma client
# or
yarn prisma generate

# Develop
npm run dev
# or
yarn dev

# Production
npm run build
# or
yarn build

npm start
# or
yarn start
```

Khi start web sẽ run trên [http://localhost:3000](http://localhost:3000) (Mặc định).
