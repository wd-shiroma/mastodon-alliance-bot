#!/bin/bash
echo "checking running process..."

is_exec=0
cur=$(cd $(dirname $(readlink -f $0 || echo $0))/..;pwd -P)

if [ -f ${cur}/process.uid ]; then
    process_id=`cat ${cur}/process.uid`
    npx forever list | grep $process_id >/dev/null 2>&1

    if [ ! $? ]; then
        echo "* Found process.uid, but no process."
        echo "  -> Delete process.uid"
        rm ${cur}/process.uid
        is_exec=1
    fi
else
    is_exec=1
fi

if [ ${is_exec} ]; then
    echo "The process seems to be running."
else
    echo "* Start new process."
    npm start
fi

