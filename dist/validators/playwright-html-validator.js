export function validatePlaywrightHTML(content) {
    if (!content.includes("playwright") && !content.includes("Playwright")) {
        return {
            valid: false,
            error: "Missing Playwright markers in HTML content",
        };
    }
    return { valid: true };
}
//# sourceMappingURL=playwright-html-validator.js.map