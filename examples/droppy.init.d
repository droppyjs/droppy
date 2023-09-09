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

CONFIG="/srv/droppy/config"
FILES="/srv/droppy/files"
BINARY="/usr/local/bin/droppy"
RUNAS="droppy:droppy"
PIDFILE="/run/droppy.pid"

do_start() {
    start-stop-daemon --start --background \
      --pidfile "$PIDFILE" --make-pidfile -c "$RUNAS" \
      --exec "$BINARY" -- start -c "$CONFIG" -f "$FILES"
}

do_stop() {
    start-stop-daemon --stop --oknodo \
       --pidfile "$PIDFILE" --remove-pidfile -c "$RUNAS"
}

do_status() {
    if start-stop-daemon --status --pidfile "$PIDFILE" -c "$RUNAS"
    then
        echo "$BINARY is running"
    else
        echo "$BINARY stopped"
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
