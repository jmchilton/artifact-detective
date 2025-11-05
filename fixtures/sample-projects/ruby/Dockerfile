FROM ruby:3.3.0-alpine

WORKDIR /workspace

# Install build dependencies
RUN apk add --no-cache build-base git

# Install dependencies from Gemfile
COPY Gemfile ./
RUN bundle install

# Copy source code
COPY . .

# Output directory mounted as volume
RUN mkdir -p /output
