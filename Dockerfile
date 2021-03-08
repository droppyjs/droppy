FROM node:alpine
LABEL maintainer="https://github.com/droppy-js/droppy"

# Copy files
COPY ["node_modules", "/droppy/node_modules"]
COPY ["packages/client", "/droppy/client"]
COPY ["packages/server", "/droppy/server"]
COPY ["packages/cli", "/droppy/cli"]
COPY ["dist", "/droppy/dist"]
COPY ["droppy.js", "docker-start.sh", "README.md", "LICENSE", "package.json", "/droppy/"]

# Install build dependencies and and build modules
RUN cd /droppy && \
  find /droppy -type d -exec chmod 0755 {} + && \
  find /droppy -type f -exec chmod 0644 {} + && \
  chmod 0755 /droppy/docker-start.sh && \
  chmod 0755 /droppy/droppy.js && \
  mkdir -p /root/.droppy && \
  ln -s /config /root/.droppy/config && \
  ln -s /files /root/.droppy/files && \
  ln -s /droppy/droppy.js /usr/bin/droppy && \
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
