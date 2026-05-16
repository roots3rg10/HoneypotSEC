FROM python:3.12-alpine
WORKDIR /app
RUN mkdir -p /app/logs
COPY portmon.py .
CMD ["python", "-u", "portmon.py"]
