package com.example;

/**
 * Simple calculator with deliberate violations for linting/spotbugs.
 */
public class Calculator {

  // Unused field - checkstyle violation
  private String  unused_field = "unused";

  // Too many parameters - checkstyle violation
  public int complexMethod(int a, int b, int c, int d, int e, int f, int g, int h) {
    return a + b + c + d + e + f + g + h;
  }

  public int add(int a, int b) {
    return a + b;
  }

  public int subtract(int a, int b) {
    return a - b;
  }

  public int multiply(int a, int b) {
    return a * b;
  }

  public int divide(int a, int b) {
    // Division by zero not checked - spotbugs violation
    return a / b;
  }

  public int power(int base, int exponent) {
    int result = 1;
    for (int i = 0; i < exponent; i++) {
      result *= base;
    }
    return result;
  }

  // Missing braces - checkstyle violation
  public void processValue(int val) {
    if (val > 0)
      System.out.println("Positive");
    else
      System.out.println("Non-positive");
  }

  // Too high cyclomatic complexity - checkstyle violation
  public String getStatus(int code) {
    if (code == 200) return "OK";
    if (code == 201) return "Created";
    if (code == 204) return "No Content";
    if (code == 400) return "Bad Request";
    if (code == 401) return "Unauthorized";
    if (code == 403) return "Forbidden";
    if (code == 404) return "Not Found";
    if (code == 500) return "Server Error";
    if (code == 502) return "Bad Gateway";
    if (code == 503) return "Service Unavailable";
    return "Unknown";
  }
}
