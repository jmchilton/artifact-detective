FROM maven:3.9.6-eclipse-temurin-21-alpine

WORKDIR /app

COPY pom.xml .
COPY checkstyle.xml .
COPY spotbugs-exclude.xml .
COPY src/ src/

RUN mkdir -p /output

CMD ["sh", "-c", "\
  echo '=== Running Maven Build ===' && \
  mvn clean verify 2>&1 || true && \
  \
  echo '=== Copying Artifacts ===' && \
  echo 'Available artifacts in target/:' && \
  find target -type f -name '*.xml' 2>/dev/null || true && \
  echo '' && \
  echo 'Copying test reports...' && \
  cp -v target/surefire-reports/TEST-*.xml /output/ 2>/dev/null || echo 'No test reports found in target/surefire-reports' && \
  echo 'Copying checkstyle report...' && \
  cp -v target/checkstyle-result.xml /output/ 2>/dev/null || echo 'No checkstyle report found' && \
  echo 'Copying spotbugs report...' && \
  cp -v target/spotbugsXml.xml /output/ 2>/dev/null || echo 'No spotbugs report found' && \
  echo '' && \
  echo 'Final artifacts in /output/:' && \
  ls -lah /output/ \
"]
