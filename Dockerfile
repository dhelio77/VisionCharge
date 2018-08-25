FROM collinestes/docker-node-oracle

RUN mkdir /src
WORKDIR /src

COPY package.json .
RUN npm install --production

CMD ["node", "server"]
COPY . .