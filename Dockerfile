FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++ gcc && \
    python3 -m ensurepip && \
    pip3 install --upgrade pip setuptools

RUN mkdir /app
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache python3 make g++ gcc && \
    python3 -m ensurepip && \
    pip3 install --upgrade pip setuptools

RUN mkdir /app
WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package.json 
COPY --from=builder /app/package.json /app/package-lock.json /app/

RUN npm install --production && npm cache clean --force

CMD ["node", "build/index.js"]
