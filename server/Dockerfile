FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client inside the image (needed when PERSIST=prisma)
RUN npx prisma generate || true

EXPOSE 3001

CMD [ "node", "index.js" ]
