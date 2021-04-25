#!/bin/sh

### BEGIN INIT INFO
# Provides:          droppy
# Required-Start:    $network $remote_fs $local_fs
# Required-Stop:     $network $remote_fs $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: droppy
# Description:       droppy - github.com/droppyjs/droppy
### END INIT INFO

DROPPY_CONFIG_DIR="/srv/droppy/config"
DROPPY_FILES_DIR="/srv/droppy/files"

PROCESS="droppy"
RUNAS="droppy:droppy"
CMD="/usr/bin/env droppy -- start -c '$DROPPY_CONFIG_DIR' -f '$DROPPY_FILES_DIR'"

do_start() {
    start-stop-daemon --start --background -c $RUNAS --name $PROCESS --exec $CMD 
}

do_stop() {
    start-stop-daemon --stop --name $PROCESS
}

do_status() {
    if pgrep -x "$PROCESS" >/dev/null
    then
        echo "$PROCESS is running"
    else
        echo "$PROCESS stopped"
    fi
}

case "$1" in
  start)
    do_start
  ;;
  stop)
    do_stop
  ;;
  status)
    do_status
  ;;
  restart)
    do_stop
    do_start
  ;;
  *)
    echo "Usage: "$1" {start|stop|status|restart}"
    exit 1
  ;;
esac

exit 0
