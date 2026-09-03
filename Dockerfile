# ---------- Stage 1: збирання залежностей ----------
FROM python:3.12-alpine AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Stage 2: фінальний легкий образ ----------
FROM python:3.12-alpine

WORKDIR /app

COPY --from=builder /install /usr/local

COPY app.py .

RUN mkdir -p /images /logs

EXPOSE 8000

CMD ["python3", "app.py"]