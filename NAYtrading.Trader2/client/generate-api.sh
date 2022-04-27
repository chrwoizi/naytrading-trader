#!/bin/sh
apiPath="$(cd "$(dirname "${PWD}/../server/openapi.json")"; pwd)/$(basename "${PWD}/../server/openapi.json")"
export MSYS_NO_PATHCONV=1
#docker run --network host --add-host="localhost:192.168.65.1" --rm -v ${PWD}:/local openapitools/openapi-generator:cli-latest-release  generate -i "http://localhost:4010/api" -g html -o /local
#docker run --network host --rm -v ${PWD}:/local openapitools/openapi-generator:cli-latest-release route | awk '/^default/ { print $2 }'
docker run --rm -v ${PWD}:/local -v ${apiPath}:/openapi.json openapitools/openapi-generator:cli-latest-release generate -i /openapi.json -g typescript-angular -o /local/app/api/ --additional-properties=serviceSuffix=ServiceClient,serviceFileSuffix=.service.client

