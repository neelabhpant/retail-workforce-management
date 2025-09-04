FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements_docker.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create data directory
RUN mkdir -p /app/data

# Copy application code
COPY . .

# Create non-root user with home directory
RUN groupadd -r appuser && useradd -r -g appuser -m -d /home/appuser appuser
RUN chown -R appuser:appuser /app
RUN mkdir -p /home/appuser && chown -R appuser:appuser /home/appuser

# Set environment variables for CrewAI/mem0 directories
ENV HOME=/home/appuser
ENV MEM0_DIR=/home/appuser/.mem0

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["uvicorn", "main_docker:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]