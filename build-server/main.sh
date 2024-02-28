# shell script file to build the server image
# !/bin/bash

export GIT_REPOSITORY_URL = "$GIT_REPOSITORY_URL"

#clone the user's code into output folder
git clone "$GIT_REPOSITORY_URL" /home/app/output

#after the user's code is cloned, run the script.js
exec node script.js