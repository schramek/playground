FROM alpine:3.21.3

RUN apk add --no-cache clamav clamav-daemon curl 

COPY files/clamd.conf /etc/clamav/clamd.conf
COPY files/freshclam.conf /etc/clamav/freshclam.conf
COPY files/scan.sh /scan.sh

RUN chmod +x /scan.sh

EXPOSE 3310

ENV MODE server

ENTRYPOINT ["sh", "/scan.sh"]