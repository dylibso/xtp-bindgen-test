#!/usr/bin/env bash
set -e

cd mock && make && cd ..
cd runner && npm i && npm run build && cd ..

rm -rf bundle
mkdir bundle
cp mock/plugin.wasm bundle/mock.wasm
cp runner/dist/plugin.wasm bundle/test.wasm
cp schema.yaml bundle

zip -r bundle.zip bundle


