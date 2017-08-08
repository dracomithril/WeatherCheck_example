#!/usr/bin/env bash


docker stop endpoint_1 endpoint_2 load_balancer
docker rm endpoint_1 endpoint_2 load_balancer

sleep 1