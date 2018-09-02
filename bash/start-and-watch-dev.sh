#!/usr/bin/env bash

# We have many scripts for views but many are encapsulated within each other
# We need to only browserify the endpoints and inner scripts for inner views are browserified as a result
# Our endpoint scripts for views are:
# taskRespond.js
# viewTaskDashboard.js

# filename: start-and-watch-dev.sh
ENDPOINTS_DIRECTORY=dist/entrypoints
VIEW_SCRIPTS_DIRECTORY=scripts/viewScripts
# Note that sometimes the view scripts might be in a deeper folder
# Example scripts/viewScripts/admin so need to be careful when adding them here

nodemon --exec heroku local --signal SIGTERM & \
watchify --transform browserify-ejs \
$VIEW_SCRIPTS_DIRECTORY/taskRespond.js \
$VIEW_SCRIPTS_DIRECTORY/viewTaskDashboard.js \
-p [ factor-bundle \
-o $ENDPOINTS_DIRECTORY/taskRespond.js \
-o $ENDPOINTS_DIRECTORY/viewTaskDashboard.js \
] \
-o dist/common.js
