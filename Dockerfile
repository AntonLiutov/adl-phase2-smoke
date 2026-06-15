FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

COPY pyproject.toml uv.lock README.md ./
COPY src ./src
COPY web ./web

RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev

ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

CMD ["uv", "run", "--no-sync", "todo-app", "--host", "0.0.0.0", "--port", "8000"]
