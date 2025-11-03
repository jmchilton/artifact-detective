package com.example;

import org.junit.Test;
import org.junit.Ignore;
import static org.junit.Assert.*;

public class CalculatorTest {

  private Calculator calc = new Calculator();

  @Test
  public void testAddition() {
    assertEquals(4, calc.add(2, 2));
  }

  @Test
  public void testSubtraction() {
    assertEquals(0, calc.subtract(5, 5));
  }

  @Test
  public void testMultiplication() {
    assertEquals(6, calc.multiply(2, 3));
  }

  @Test
  public void testDivision() {
    assertEquals(2, calc.divide(4, 2));
  }

  @Test
  public void testAdditionNegatives() {
    assertEquals(-2, calc.add(-5, 3));
  }

  @Test
  public void testMultiplicationByZero() {
    assertEquals(0, calc.multiply(100, 0));
  }

  @Test
  public void testDivisionFails() {
    // This test deliberately fails
    assertEquals(5, calc.divide(10, 2));
  }

  @Test
  @Ignore("Not yet implemented")
  public void testPower() {
    assertEquals(8, calc.power(2, 3));
  }
}
