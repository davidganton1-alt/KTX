FROM node:20-bullseye

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer || npm install

COPY . .

EXPOSE 3000

VOLUME ["/app/data"]

# Avoid Windows .bin/next wrapper; invoke Next directly on Linux.
CMD ["node", "node_modules/next/dist/bin/next", "start"]
