FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    dionaea \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/dionaea/var/log/dionaea

EXPOSE 21 42 69/udp 445 1433 1723 1883 3306

CMD ["dionaea", "-c", "/opt/dionaea/etc/dionaea/dionaea.cfg", "-l", "all", "-L", "*"]
