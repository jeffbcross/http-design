./node_modules/.bin/tsc test/*.spec.ts public/http.ts public/BaseConnectionConfig.ts -t ES5 --module commonjs -w & pid1=$!

function killAndExit () {
  kill $pid1
  exit 0
}

trap killAndExit SIGINT SIGTERM

./node_modules/.bin/watchify public/http.js test/*.spec.js node_modules/rx/index.js -o bundle.js --debug
