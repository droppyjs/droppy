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

PROCESS="droppy"
RUNAS="droppy:droppy"
CMD="/usr/bin/env droppy start -c /srv/droppy/config -f /srv/droppy/files"

do_start() {
    start-stop-daemon --start --background -c $RUNAS --name $PROCESS --exec $CMD 
}

do_stop() {
    start-stop-daemon --stop --name $PROCESS
}

case "$1" in
  start)
    do_start
  ;;
  stop)
    do_stop
  ;;
  restart)
    do_stop
    do_start
  ;;
  *)
    echo "Usage: "$1" {start|stop|restart}"
    exit 1
  ;;
esac

exit 0
