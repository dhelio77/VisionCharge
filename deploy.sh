#!/bin/bash
#
# build the docker containers
sudo docker-compose -f docker-compose.yml build app
# start the stack
sudo docker-compose -f docker-compose.yml up -d