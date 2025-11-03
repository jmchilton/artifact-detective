export function validateJUnitXML(content) {
    if (!content.includes("<testsuites") && !content.includes("<testsuite")) {
        return {
            valid: false,
            error: "Missing <testsuites> or <testsuite> root element",
        };
    }
    if (!content.includes("<testcase")) {
        return {
            valid: false,
            error: "Missing <testcase> elements",
        };
    }
    return { valid: true };
}
//# sourceMappingURL=junit-validator.js.map