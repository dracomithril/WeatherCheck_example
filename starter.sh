#!/usr/bin/env bash

docker build -t endpoint_test ./endpoint_control/
docker build -t proxy_lb ./proxy_lb/
docker run --name endpoint_1 -d -p 3000:3000 -e PORT=3000 endpoint_test
docker run --name endpoint_2 -d -p 3001:3001 -e PORT=3001 endpoint_test
IP1=`docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' endpoint_1`

IP2=`docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' endpoint_2`
echo "IPS for endpoints"
echo ${IP1}
echo ${IP2}

ENDPOINTS="[\"http://${IP1}:3000\",\"http://${IP2}:3001\"]"
echo ${ENDPOINTS}
docker run --name load_balancer -d -p 8080:8080 -e ENDPOINTS_RN="${ENDPOINTS}" -e ENDPOINTS_GW="${ENDPOINTS}" proxy_lb
sleep 5000
