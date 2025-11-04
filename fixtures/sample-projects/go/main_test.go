package main

import (
	"testing"
)

func TestAdd(t *testing.T) {
	calc := &Calculator{}
	result := calc.Add(2, 3)
	if result != 5.0 {
		t.Errorf("Add(2, 3) = %f, want 5.0", result)
	}
	if calc.GetLastResult() != 5.0 {
		t.Errorf("GetLastResult() = %f, want 5.0", calc.GetLastResult())
	}
}

func TestSubtract(t *testing.T) {
	calc := &Calculator{}
	result := calc.Subtract(10, 3)
	if result != 7.0 {
		t.Errorf("Subtract(10, 3) = %f, want 7.0", result)
	}
}

func TestMultiply(t *testing.T) {
	calc := &Calculator{}
	result := calc.Multiply(4, 5)
	if result != 20.0 {
		t.Errorf("Multiply(4, 5) = %f, want 20.0", result)
	}
}

func TestDivide(t *testing.T) {
	calc := &Calculator{}
	result, err := calc.Divide(10, 2)
	if err != nil {
		t.Errorf("Divide(10, 2) returned error: %v", err)
	}
	if result != 5.0 {
		t.Errorf("Divide(10, 2) = %f, want 5.0", result)
	}
}

func TestDivideByZero(t *testing.T) {
	calc := &Calculator{}
	_, err := calc.Divide(10, 0)
	if err == nil {
		t.Error("Divide(10, 0) should return error")
	}
	if err.Error() != "division by zero" {
		t.Errorf("Divide(10, 0) error = %s, want 'division by zero'", err.Error())
	}
}

func TestGetLastResult(t *testing.T) {
	calc := &Calculator{}
	calc.Add(1, 1)
	calc.Multiply(2, 3)
	result := calc.GetLastResult()
	if result != 6.0 {
		t.Errorf("GetLastResult() = %f, want 6.0", result)
	}
}

func TestSubtractNegative(t *testing.T) {
	t.Skip("Skipping negative subtraction test")
	calc := &Calculator{}
	result := calc.Subtract(5, 10)
	if result != -5.0 {
		t.Errorf("Subtract(5, 10) = %f, want -5.0", result)
	}
}

func TestAddWithNegatives(t *testing.T) {
	calc := &Calculator{}
	result := calc.Add(-5, 3)
	if result != -2.0 {
		t.Errorf("Add(-5, 3) = %f, want -2.0", result)
	}
}
