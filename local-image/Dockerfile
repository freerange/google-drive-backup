FROM ubuntu:latest
ARG RCLONE_VERSION="v1.60.0"
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --assume-yes wget unzip curl
RUN wget "https://github.com/ncw/rclone/releases/download/${RCLONE_VERSION}/rclone-${RCLONE_VERSION}-linux-amd64.zip" && \
    unzip "rclone-${RCLONE_VERSION}-linux-amd64.zip" && \
    mv "rclone-${RCLONE_VERSION}-linux-amd64/rclone" /usr/bin/ && \
    chmod a+x /usr/bin/rclone
WORKDIR /root
COPY home/* ./
CMD ["./backup.sh"]
