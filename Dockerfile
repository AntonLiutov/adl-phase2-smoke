FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

COPY src ./src
COPY web ./web

ENV PORT=8000

CMD ["uv", "run", "--no-sync", "todo-app", "--host", "0.0.0.0", "--port", "8000"]
