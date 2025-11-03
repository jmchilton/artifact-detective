export function validatePytestJSON(content) {
    try {
        const data = JSON.parse(content);
        if (!data.tests || !Array.isArray(data.tests)) {
            return {
                valid: false,
                error: "Missing or invalid tests array",
            };
        }
        return { valid: true };
    }
    catch (e) {
        return {
            valid: false,
            error: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        };
    }
}
export function validatePytestHTML(content) {
    if (!content.includes("pytest-html")) {
        return {
            valid: false,
            error: 'Missing pytest-html marker (link to "pytest-html" package)',
        };
    }
    return { valid: true };
}
//# sourceMappingURL=pytest-validator.js.map