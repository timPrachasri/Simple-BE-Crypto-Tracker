

## Getting Started (Anymind Crypto Backend)
---

### Prerequisites
- docker
- makefile
- Install module's dependencies (for seed and Prisma deploy)
  - Since this is for development purpose, some scripts need to be called separately after starting the Docker environment:
  ```bash
  yarn install
  ```

### Starting API (using docker)
  - Run make `docker/up` using the makefile to instantiate a Docker environment:
  ```bash
    make docker/up
  ```  
  - Wait for `database system is ready to accept connections` and `[App]: Listening on port 300` signal
  - Change .env `DATABASE_URL` to local, since we are executing the rest scripts using a local call (if you can execute using docker exec cli, you can skip this part)
  - Run yarn `db:migrate:cd_deploy` to migrate any unmigrated migration files. More information can be found [Here](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy)
  ```bash
    yarn db:migrate:cd_deploy
  ``` 
  - Result from `yarn db:migrate:cd_deploy`
  ```bash
    yarn db:migrate:cd_deploy 
    yarn run v1.22.17
    warning ../../package.json: No license field
    $ npx prisma migrate deploy
    Environment variables loaded from .env
    Prisma schema loaded from prisma/schema.prisma
    Datasource "db": PostgreSQL database "crypto_be_db", schema "public" at "localhost:5432"

    3 migrations found in prisma/migrations

    Applying migration `20230122165956_init_schemas`
    Applying migration `20230122171131_alter_tables_name`
    Applying migration `20230123041223_alter_tables_structure`

    The following migrations have been applied:

    migrations/
      └─ 20230122165956_init_schemas/
        └─ migration.sql
      └─ 20230122171131_alter_tables_name/
        └─ migration.sql
      └─ 20230123041223_alter_tables_structure/
        └─ migration.sql
          
    All migrations have been successfully applied.
  ```
  - Seed a BTC token
  ```bash
    yarn db:seed
  ``` 
  - Result from `yarn db:seed`
  ```bash
    yarn db:seed
    yarn run v1.22.17
    warning ../../package.json: No license field
    $ npx prisma db seed 
    Environment variables loaded from .env
    Running seed command `node -r tsconfig-paths/register -r ts-node/register prisma/seed_bitcoin_20230123230500.ts` ...
    >> Seeding token: Bitcoin (BTC)
    >> DONE seeding token: Bitcoin (BTC)

    🌱  The seed command has been executed.
    ✨  Done in 5.37s.
  ```
### Starting API (non-docker)
  - Run make `docker/db/up` using the makefile to instantiate a Postgres environment:
  ```bash
    make docker/db/up
  ```  
  - Wait for `database system is ready to accept connections` signal
  - Change .env `DATABASE_URL` to local, since we are executing the rest scripts using a local call (if you can execute using docker exec cli, you can skip this part)
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
DATABASE_URL="postgresql://postgres:mypass@postgres:5432/crypto_be_db?schema=public"

# for local development use this url in the .env file
# DATABASE_URL="postgresql://postgres:mypass@localhost:5432/crypto_be_db?schema=public"
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

**Enjoy!**