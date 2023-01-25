docker/up:
	docker-compose -f docker/docker-compose.yml up --build

docker/up-cache:
	docker-compose -f docker/docker-compose.yml up

docker/down:
	docker-compose -f docker/docker-compose.yml down

docker/db/up:
	docker-compose -f docker/docker-compose.yml up -d db