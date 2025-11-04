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
  find target -type f | grep -E '\\.xml$|\\.sarif$|\\.html$' || true && \
  echo '' && \
  echo 'Copying test reports...' && \
  cp -v target/surefire-reports/TEST-*.xml /output/ 2>/dev/null || echo 'No test reports found in target/surefire-reports' && \
  echo 'Generating surefire HTML report...' && \
  mvn surefire-report:report-only -DexcludeJunitInformationReportingPackages='java.,javax.,sun.,com.sun.' -DskipTests=true 2>/dev/null || true && \
  echo 'Copying surefire HTML report...' && \
  cp -v target/site/surefire-report.html /output/surefire-report.html 2>/dev/null || echo 'No surefire HTML report found' && \
  echo 'Copying checkstyle XML report...' && \
  cp -v target/checkstyle-result.xml /output/ 2>/dev/null || echo 'No checkstyle XML report found' && \
  echo 'Copying checkstyle SARIF report...' && \
  cp -v target/checkstyle-result.sarif /output/ 2>/dev/null || echo 'No checkstyle SARIF report found' && \
  echo 'Copying spotbugs report...' && \
  cp -v target/spotbugsXml.xml /output/ 2>/dev/null || echo 'No spotbugs report found' && \
  echo '' && \
  echo 'Final artifacts in /output/:' && \
  ls -lah /output/ \
"]
