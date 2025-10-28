Тестовое задание SEI Integration
Требования

Node.js 20+

npm 9+

Docker и Docker Compose (опционально)

Скопируйте файл .env.example в .env и при необходимости измените значения:

EVM_RPC_URL=https://sei-evm-rpc.publicnode.com
COSMOS_RPC_URL=https://sei-m.rpc.n0ok.net:443
PORT=3000

Установка зависимостей
npm install

Локальный запуск
npm run dev


Команда запускает приложение NestJS в режиме разработки с автоматической перезагрузкой при изменениях кода (nest start --watch).

Для запуска в продакшн-режиме:

npm run build
npm start

Запуск через Docker
docker-compose up --build


После сборки API будет доступен по адресу: http://localhost:3000

Быстрая проверка

Теперь можно протестировать без ручного поиска высот:

GET /evm/block/latest — возвращает последний блок EVM

GET /cosmos/block/latest — возвращает последний блок Cosmos

Также маршрут /evm/block/:height теперь принимает как десятичные, так и hex-значения высоты (например: 123456 или 0x1e240).

Эндпоинты
GET /evm/block/:height

Получает данные блока EVM через один JSON-RPC вызов eth_getBlockByNumber с параметром fullTransactions=false.

curl http://localhost:3000/evm/block/123

GET /evm/transactions/:hash

Получает данные транзакции EVM через метод eth_getTransactionByHash.

curl http://localhost:3000/evm/transactions/0xHASH

GET /cosmos/block/:height

Получает блок Cosmos через Tendermint RPC /block.

curl http://localhost:3000/cosmos/block/123

GET /cosmos/transactions/:hash

Получает транзакцию Cosmos с помощью Tendermint RPC /tx, при необходимости используя fallback cosmos/tx/v1beta1/txs/{hash}.

curl http://localhost:3000/cosmos/transactions/0xHASH

Тестирование
npm test


End-to-end тесты используют мокированные HTTP-вызовы (nock) для маршрутов EVM.

Особенности реализации

/evm/block/:height выполняет строго один JSON-RPC запрос (без дополнительных обращений).

Парсинг комиссий в Cosmos объединяет все элементы в строку вида amount+denom, разделённую запятыми.

При определении отправителя приоритет отдаётся первому публичному ключу signer, при его отсутствии берётся адрес из первого сообщения транзакции.

Что реализовано:

Эндпоинты для EVM и Cosmos:

/evm/block/:height — один JSON-RPC вызов eth_getBlockByNumber

/evm/transactions/:hash — данные транзакции по хэшу

/cosmos/block/:height — получение блока через Tendermint RPC

/cosmos/transactions/:hash — транзакция Cosmos с fallback на REST

Добавлены удобные маршруты /evm/block/latest и /cosmos/block/latest

Валидация параметров, централизованная обработка ошибок и таймаутов

Полная поддержка .env конфигурации

SQL-запрос для выборки транзакций топ-N блоков

Тесты e2e с моками для EVM

Результат:
Приложение полностью соответствует техническому заданию.
Все маршруты работают корректно, структура проекта модульная и чистая, запуск возможен как локально, так и через Docker.