# Pin the base by digest in CI once the registry is set up; Dependabot keeps it current.
FROM python:3.15-slim AS build
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --require-hashes --target /deps -r requirements.txt

FROM python:3.15-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/deps:/app
# Apply Debian security fixes released after the base image was built.
RUN apt-get update && apt-get upgrade -y --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN useradd --uid 10001 --no-create-home --shell /usr/sbin/nologin api
WORKDIR /app
COPY --from=build /deps /deps
COPY app ./app
USER 10001
EXPOSE 8000
# Run with a read-only root filesystem in Container Apps; the app writes nothing to disk.
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-server-header"]
