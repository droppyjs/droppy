#!/bin/sh

[ -z "$UID" ] && UID=0
[ -z "$GID" ] && GID=0

# echo >> /etc/xxx and not adduser/addgroup because adduser/addgroup
# won't work if uid/gid already exists.
echo -e "droppy:x:${UID}:${GID}:droppy:/home/droppy:/bin/false\n" >> /etc/passwd
echo -e "droppy:x:${GID}:droppy\n" >> /etc/group

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

exec /bin/su -l -p -s "/bin/sh" -c "exec node /droppy/cli/lib/cli.js start" droppy
