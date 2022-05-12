FROM ubuntu:latest
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --assume-yes curl unzip
RUN curl https://rclone.org/install.sh | bash
WORKDIR /root
COPY home/* ./
CMD ["./backup.sh"]
