#!/usr/bin/env bash


for i in 0 1
do
docker stop endpoint_${i}
docker rm endpoint_${i}
done
docker stop load_balancer
docker rm load_balancer

sleep 1