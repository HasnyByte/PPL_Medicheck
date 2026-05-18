FROM node:20-bullseye

WORKDIR /app

# copy package
COPY package*.json ./

# install deps
RUN npm install

# copy semua file
COPY . .

# generate prisma client
RUN npx prisma generate

# expose port (Railway pakai PORT env, tapi ini tetap oke)
EXPOSE 4000

# run app
CMD ["node", "src/index.js"]