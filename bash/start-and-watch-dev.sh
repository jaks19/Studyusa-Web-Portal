#!/usr/bin/env bash

# List of views:

# filename: start-and-watch-dev.sh
FOLDERNAME=public

nodemon --exec heroku local --signal SIGTERM & \
watchify \
indexify.js \
indexify2.js \
-p [ factor-bundle \
-o dist/indexify1.js \
-o dist/indexify2.js \
] \
-o dist/common.js
