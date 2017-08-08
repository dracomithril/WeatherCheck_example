#!/usr/bin/env bash

docker build -t endpoint_test ./endpoint_control/
docker build -t proxy_lb ./proxy_lb/

docker run --name endpoint_1 -d -p 3000:3000 -e PORT=3000 endpoint_test
docker run --name endpoint_2 -d -p 3001:3001 -e PORT=3001 endpoint_test
docker run --name load_balancer -d -p 8080:8080 -e ENDPOINTS_RN='["http://localhost:3000", "http://localhost:3001"]' -e ENDPOINTS_GW='["http://localhost:3000","http://localhost:3001"]' proxy_lb