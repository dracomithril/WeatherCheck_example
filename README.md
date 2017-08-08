# WeatherCheck_example

prerequisites
docker-machine set up


To run all project simply clone repo run starter.sh it will build dockers images foe endpoints and loadbalancer.
Endpoints will start on pot 33000 to 3300* depending on number of instances
Loadbalancer will start on 8090


To stop containers use stop_all.sh



/api/lb/registerInstance -add new instance
/api/lb/instances -view all registered instances