FROM oven/bun:1 as base

WORKDIR /app

COPY package.json .
COPY bun.lockb* ./

RUN bun install --frozen-lockfile || bun install

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "start"]

