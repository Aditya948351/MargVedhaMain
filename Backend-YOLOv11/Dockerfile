FROM python:3.10-slim

WORKDIR /app

# Install basic OS dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source files
COPY . .

# Expose the Flask Port
EXPOSE 5000

# Start the Flask development server on 0.0.0.0
CMD ["python", "app.py"]
