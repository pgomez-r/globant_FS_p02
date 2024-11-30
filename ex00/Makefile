CONTAINER_NAME=trip_recommendator
PORT=5500

# Full build and run
all: build run

# Build the Docker container
build:
	docker build --no-cache --progress=plain -t ${CONTAINER_NAME} .

# Run the Docker container on develop service
dev:
	CONTAINER_NAME=${CONTAINER_NAME} docker-compose up dev -d --no-build

# Run the Docker container on web service (deploy the  website on localhost)
run:
	CONTAINER_NAME=${CONTAINER_NAME} docker-compose up web -d --no-build

# Get into Docker container terminal
shell:
	docker exec -it ${CONTAINER_NAME} /bin/sh

# Stop and remove the Docker container
stop:
	docker-compose down

# Remove all docker images in system
clean:
	docker rmi -f $$(docker images -q)

# Remove all stopped containers, unused networks, and dangling images to free up space
fclean:
	docker container prune -f
	docker network prune -f
	docker image prune -f
	docker volume prune -f

.PHONY: all build run dev shell stop clean fclean
