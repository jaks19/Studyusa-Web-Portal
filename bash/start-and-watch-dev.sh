#!/usr/bin/env bash

# taskRespond

# filename: start-and-watch-dev.sh

nodemon --exec heroku local --signal SIGTERM & \
watchify \
scripts/views/taskRespond.js \
-p [ factor-bundle \
-o dist/taskRespond.js \
] \
-o dist/common.js
