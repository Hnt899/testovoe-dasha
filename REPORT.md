Отчёт о выполнении тестового задания
Используемый стек

Node.js 20

NestJS 10

axios

class-validator / class-transformer

Jest + Supertest + nock

Docker и Docker Compose

Реализовано

Эндпоинт /evm/block/:height — выполняет один JSON-RPC вызов eth_getBlockByNumber (fullTransactions = false), с преобразованием hex-полей газа в десятичные значения.

Эндпоинт /evm/transactions/:hash — возвращает указанные поля, включая переименование maxPriorityFeePerGas в maxPriotityFeePerGas (согласно ТЗ).

Эндпоинт /cosmos/block/:height — реализован через Tendermint RPC /block.

Эндпоинт /cosmos/transactions/:hash — использует основной поиск через Tendermint /tx и fallback через REST cosmos/tx/v1beta1/txs/{hash}, с безопасным парсингом комиссии и отправителя.

Добавлены DTO с валидацией, глобальная ValidationPipe, перехватчик таймаутов и централизованный фильтр ошибок HTTP.

Добавлены e2e-тесты для маршрутов EVM с мокированными RPC-ответами.

Подготовлены Dockerfile, docker-compose.yml, Postman-коллекция и SQL-запрос для выборки транзакций из top-N блоков.

Как запустить

Локально:

npm install
npm run dev


Через Docker:

docker-compose up --build


Приложение будет доступно по адресу:
http://localhost:3000