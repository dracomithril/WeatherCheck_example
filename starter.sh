#!/usr/bin/env bash
#prapare for multi instance test
docker build -t endpoint_test ./endpoint_control/
docker build -t proxy_lb ./proxy_lb/
ENDPOINTS_LIST=()
for i in 0 1
do
PORT="3300${i}"
docker run --name endpoint_${i} -d -p ${PORT}:${PORT} -e PORT=${PORT} endpoint_test
IP=(`docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' endpoint_${i}`)
ENDPOINTS_LIST+=("\"http://${IP}:${PORT}\"")
done

echo "IPS for endpoints"
EP_STR=$(IFS=, ; echo "${ENDPOINTS_LIST[*]}")
ENDPOINTS="[${EP_STR}]"
echo ${ENDPOINTS}
LB_PORT=8090
docker run --name load_balancer -d -p ${LB_PORT}:${LB_PORT} -e ENDPOINTS_RN="${ENDPOINTS}" -e ENDPOINTS_GW="${ENDPOINTS}" -e PORT=${LB_PORT} proxy_lb
sleep 5
