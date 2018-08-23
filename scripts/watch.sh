#!/bin/bash
echo "checking running process..."

is_exec=0
cur=$(cd $(dirname $(readlink -f $0 || echo $0))/..;pwd -P)

if [ -f ${cur}/process.uid ]; then
    process_id=`cat ${cur}/process.uid`
    forever=`npx forever list | grep $process_id`

    if [ "$?" = 0 ]; then
        echo "* Found process.uid, but no process."
        echo "  -> Delete process.uid"
        rm ${cur}/process.uid
        is_exec=1
    fi

    line=`echo $forever | grep -E '^\d+:\d+:\d+' | wc -l`
    if [ ! $line ]; then
        echo "* Process was stopped."
        echo "  -> kill process: $process_id"
        npx forever stop $forever
        is_exec=1
    fi
else
    is_exec=1
fi

if [ "${is_exec}" = 0 ]; then
    echo "The process seems to be running."
else
    echo "* Start new process."
    npm start
fi

