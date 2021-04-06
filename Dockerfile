FROM node:alpine as builder

RUN apk add --no-cache make gcc g++ python git
RUN git clone https://github.com/droppy-js/droppy /droppy
RUN rm -rf /droppy/node_modules && \
    cd /droppy && \
    yarn && \
    yarn bootstrap

FROM node:alpine
LABEL maintainer="https://github.com/droppy-js/droppy"

# Copy files
COPY --from=builder ["/droppy/node_modules", "/droppy/node_modules"]
COPY --from=builder ["/droppy/packages/client", "/droppy/client"]
COPY --from=builder ["/droppy/packages/server", "/droppy/server"]
COPY --from=builder ["/droppy/packages/cli", "/droppy/cli"]
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

EXPOSE 8989
VOLUME ["/config", "/files"]
CMD ["/droppy/docker-start.sh"]
