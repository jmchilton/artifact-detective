FROM golang:1.23.0-alpine

# Install golangci-lint
RUN apk add --no-cache curl && \
    curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b /usr/local/go/bin v1.59.1

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Create output directory
RUN mkdir -p /output

# Run go test with JSON output
RUN go test -v -json ./... > /output/go-test.json 2>&1 || true

# Run golangci-lint with JSON output
RUN golangci-lint run --out-format json ./... > /output/golangci-lint.json 2>&1 || true

# Display artifacts generated
RUN echo "=== Generated Artifacts ===" && \
    ls -lh /output/
