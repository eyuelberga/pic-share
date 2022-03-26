#! /bin/bash

set -x

# server
npm run dev:server &
# client 1
export PORT=3010
npm run dev:client &
# client 2
export PORT=3020
export PARTITION_LIST=00,01,02
npm run dev:client &
# client 3
export PORT=3030
export PARTITION_LIST=03,04,05
npm run dev:client

# kill background jobs
kill %1
kill %2
kill %3
