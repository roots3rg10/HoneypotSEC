FROM python:3.11-slim

RUN mkdir -p /var/log/honeyd

WORKDIR /opt/honeyd

COPY honeypot.py .
COPY honeyd.conf /etc/honeyd.conf

EXPOSE 23 25 80

CMD ["python", "honeypot.py"]
