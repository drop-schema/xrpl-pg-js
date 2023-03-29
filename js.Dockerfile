FROM ubuntu:22.04 AS node-pg-ws
RUN apt-get update && apt-get upgrade && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - && apt-get install -y nodejs
RUN npm install -g npm n && n latest
COPY "./ws_pg/package.json" "/ws_pg/"
WORKDIR "/ws_pg"
RUN npm install
COPY "./ws_pg" "/ws_pg"
