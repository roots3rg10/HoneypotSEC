FROM python:3.12-alpine
WORKDIR /app
RUN mkdir -p /app/logs
COPY webhoneypot.py .
EXPOSE 80
CMD ["python", "-u", "webhoneypot.py"]
