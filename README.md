

## Getting Started (Anymind Crypto Backend)
---

### Prerequisites
- docker
- Install module's dependencies (for seed and Prisma deploy)
  - Since this is for development purpose, some scripts need to be called separately after starting the Docker environment:
  ```bash
  yarn install
  ```

### Starting API (using docker - recommended)
  - Run make `docker/up` using the makefile to instantiate a Docker environment:
  ```bash
    make docker/up
  ```  
  - Run yarn `db:migrate:cd_deploy` to migrate any unmigrated migration files. More information can be found [Here](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy)
  ```bash
    yarn db:migrate:cd_deploy
  ``` 
  - Seed a BTC token
  ```bash
    yarn db:seed
  ``` 
### Starting API (non-docker)
  - Run make `docker/db/up` using the makefile to instantiate a Postgres environment:
  ```bash
    make docker/db/up
  ```  
  - Run yarn `db:migrate:cd_deploy` to migrate any unmigrated migration files. More information can be found [Here](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy)
  ```bash
    yarn db:migrate:cd_deploy
  ``` 
  - Seed a BTC token
  ```bash
    yarn db:seed
  ``` 
  - Start a server
  ```bash
    yarn dev
  ``` 
### Environment Variables
- Use the following environment variables:
```bash
# use this DATABASE_URL for running PostgreSQL on Docker compose
#DATABASE_URL="postgresql://postgres:mypass@postgres:5432/crypto_be_db?schema=public"

# for local development use this url in the .env file
NODE_ENV=develop
DATABASE_URL="postgresql://postgres:mypass@localhost:5432/crypto_be_db?schema=public"
```

### Endpoints
There are 3 endpoints with different use cases
- POST `/api/v1/wallet-histories.create` is for creating a wallet history. Example usage:
```
curl --location --request POST 'http://localhost:3002/api/v1/wallet-histories.create' \
--header 'Content-Type: application/json' \
--data-raw '{
    "datetime": "2022-10-14T14:48:01+04:00",
    "amount": 2324.1111
}'
```
- GET `/api/v1/wallet-histories` is for getting wallet histories grouped by hour. Example usage:
```
curl --location --request GET 'http://localhost:3002/api/v1/wallet-histories' \
--header 'Content-Type: application/json' \
--data-raw '{
"startDatetime": "2022-01-05T06:48:01+00:00",
"endDatetime": "2022-12-05T23:14:59+00:00"
}'
```
- GET `/api/v1/current-balance` is for getting the latest current balance of the user. Example usage:
```
curl --location --request GET 'http://localhost:3002/api/v1/current-balance'
```
> Also, make sure that you replace the http://localhost:3002 with the right url of the API endpoint.