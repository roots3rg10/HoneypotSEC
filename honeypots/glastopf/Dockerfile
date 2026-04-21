FROM python:3.11-slim

RUN pip install --no-cache-dir flask

RUN mkdir -p /opt/glastopf/log

WORKDIR /opt/glastopf

COPY honeypot.py .

EXPOSE 80

CMD ["python", "honeypot.py"]
