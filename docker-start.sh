#!/bin/bash
# Droppy docker start file
#
#           .:.
#    :::  .:::::.    Droppy
#  ..:::..  :::      Made with love <3
#   ':::'   :::
#     '
#


# Determine a UID/GID otherwise default to 0
[ -z "${UID}" ] && UID=0
[ -z "${GID}" ] && GID=0

FILE="/droppy/UID-${UID}_GID-${GID}"
if [ ! -f "${FILE}" ]; then
  # echo >> /etc/xxx and not adduser/addgroup because adduser/addgroup
  # won't work if uid/gid already exists.
  echo -e "droppy:x:${UID}:${GID}:droppy:/home/droppy:/bin/false" >> /etc/passwd
  echo -e "droppy:x:${GID}:droppy" >> /etc/group

  # create shadow files from /etc/passwd and /etc/group
  grpconv
  pwconv

  # it's better to do that (mkdir and chown) here than in the Dockerfile
  # because it will be executed even on volumes if mounted.
  mkdir -p /config
  mkdir -p /files

  mkdir -p /home/droppy/.droppy

  ln -s /config /home/droppy/.droppy/config
  ln -s /files /home/droppy/.droppy/files

  chown -R droppy:droppy /home/droppy

  chown -R droppy:droppy /config
  chown droppy:droppy /files

  export HOME=/home/droppy

  volta install node

  touch "${FILE}"
fi

exec /bin/su droppy -s /bin/bash -c "node /droppy/packages/cli/lib/cli.js start"
