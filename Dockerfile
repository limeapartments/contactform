FROM alpine:latest
MAINTAINER Chance Hudson

RUN apk add --no-cache nodejs-npm

COPY . .

RUN npm install

CMD ["/usr/bin/node", "."]
