# Droppy Dockerfile
#
#           .:.
#    :::  .:::::.    Droppy
#  ..:::..  :::      Made with love <3
#   ':::'   :::
#     '
#

# -------------------------------------------------- #
# BASE
# -------------------------------------------------- #

FROM node:20-bookworm-slim AS base

SHELL ["/bin/bash", "-c"]

ENV DEBIAN_FRONTEND noninteractive
ENV BASH_ENV ~/.bashrc

RUN apt-get -y update && \
    apt-get -y install --no-install-recommends \
        ca-certificates \
        bash \
        openssl && \
    rm -rf /var/lib/apt/lists/*


# -------------------------------------------------- #
# BUILDER
# -------------------------------------------------- #

FROM base AS builder

RUN apt-get -y update && \
    apt-get -y install --no-install-recommends \
        git \
        python3 \
        make \
        gcc \
        g++ && \
    rm -rf /var/lib/apt/lists/*

COPY . /droppy

RUN rm -rf /droppy/node_modules && \
    cd /droppy && \
    corepack enable && \
    yarn install --immutable && \
    yarn build


# -------------------------------------------------- #
# APPLICATION
# -------------------------------------------------- #

FROM base AS application
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
    /usr/local/share/.cache && \
  rm -rf /var/cache/apt/archives/ \
    /var/lib/apt/lists/ \
    /usr/share/man/ \
    /usr/share/locale/ \
    /usr/share/doc/


EXPOSE 8989
VOLUME ["/config", "/files"]
CMD ["/droppy/docker-start.sh"]
