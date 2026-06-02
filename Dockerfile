FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY interclaw_coordinator_standalone.js ./

# Zeabur will set PORT; default to 8080
ENV PORT=8080
ENV DATA_FILE=/data/coordinator_state.json

# Use /data for persistence (Zeabur persistent volume mount point)
VOLUME ["/data"]

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

CMD ["node", "interclaw_coordinator_standalone.js"]
