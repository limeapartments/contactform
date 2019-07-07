FROM alpine:latest
MAINTAINER Chance Hudson

RUN apk add --no-cache nodejs-npm && \
    mkdir /src

WORKDIR /src

COPY . .

RUN npm ci

CMD ["/usr/bin/node", "."]
