FROM maven:3.9.6-eclipse-temurin-21-alpine

WORKDIR /app

COPY pom.xml .
COPY checkstyle.xml .
COPY spotbugs-exclude.xml .
COPY src/ src/

RUN mkdir -p /output

CMD ["sh", "-c", "\
  echo '=== Running Maven Tests ===' && \
  mvn clean test 2>&1 || true && \
  \
  echo '=== Running Checkstyle ===' && \
  mvn checkstyle:check 2>&1 || true && \
  \
  echo '=== Running SpotBugs ===' && \
  mvn spotbugs:check 2>&1 || true && \
  \
  echo '=== Copying Artifacts ===' && \
  cp -v target/surefire-reports/TEST-*.xml /output/ 2>/dev/null || echo 'No test reports' && \
  cp -v target/checkstyle-result.xml /output/ 2>/dev/null || echo 'No checkstyle report' && \
  cp -v target/spotbugsXml.xml /output/ 2>/dev/null || echo 'No spotbugs report' && \
  ls -lah /output/ \
"]
