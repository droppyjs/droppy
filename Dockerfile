# Droppy Dockerfile
#
#           .:.
#    :::  .:::::.    Droppy
#  ..:::..  :::      Made with love <3 
#   ':::'   :::      
#

# -------------------------------------------------- #
# BASE
# -------------------------------------------------- #

FROM debian:10.9 as base

SHELL ["/bin/bash", "-c"]

ENV DEBIAN_FRONTEND=noninteractive
ENV BASH_ENV ~/.bashrc
ENV VOLTA_HOME /root/.volta
ENV PATH $VOLTA_HOME/bin:$PATH

RUN apt-get -y update
RUN apt-get -y install aria2 gnupg software-properties-common \
                       python3 git curl bash openssl
 
RUN curl https://get.volta.sh | bash
RUN volta setup
RUN volta --version

# -------------------------------------------------- #
# BUILDER
# -------------------------------------------------- #

FROM base as builder

RUN apt-get -y install -y make gcc g++ 
RUN git clone --depth=1  https://github.com/droppyjs/droppy /droppy
RUN rm -rf /droppy/node_modules && \
    cd /droppy && \
    yarn 


# -------------------------------------------------- #
# APPLICATION
# -------------------------------------------------- #

FROM base as application
LABEL maintainer="https://github.com/droppyjs/droppy"

# Copy files
COPY --from=builder ["/droppy/node_modules", "/droppy/node_modules"]
COPY --from=builder ["/droppy/packages", "/droppy/packages"]
COPY --from=builder ["/droppy/docker-start.sh", "/droppy/README.md", "/droppy/LICENSE", "/droppy/"]

# Install build dependencies and and build modules
RUN cd /droppy && \
  chmod 0755 /droppy/docker-start.sh && \
  mkdir -p /root/.droppy && \
  ln -s /config /root/.droppy/config && \
  ln -s /files /root/.droppy/files && \
  rm -rf \
    /root/.config \
    /root/.node-gyp \
    /root/.npm \
    /tmp/* \
    /usr/lib/node_modules \
    /usr/local/lib/node_modules \
    /usr/local/share/.cache


## Lets slim the image down!

# systemd uses 26.6 MB of space! 
RUN apt-get -y remove --purge --auto-remove systemd

# remove our cache from apt-get
RUN rm -rf /var/cache/apt/archives/

# apt-get update cache (17 MB)
RUN rm -rf /var/lib/apt/lists/

# man page ~6 MB
RUN rm -rf /usr/share/man/

# unused locale data ~31 MB 
RUN rm -rf /usr/share/locale/

# unused mandocs ~11 MB
RUN rm -rf /usr/share/doc/


EXPOSE 8989
VOLUME ["/config", "/files"]
CMD ["/droppy/docker-start.sh"]
