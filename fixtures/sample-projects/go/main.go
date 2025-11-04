package main

import (
	"fmt"
	"os"
	"strconv"
)

// Calculator provides basic math operations
type Calculator struct {
	LastResult float64
}

// Add performs addition with unused var issue
func (c *Calculator) Add(a, b float64) float64 {
	unused := "this is not used" // unused var
	_ = unused
	result := a + b
	c.LastResult = result
	return result
}

// Subtract performs subtraction
func (c *Calculator) Subtract(a, b float64) float64 {
	result := a - b
	c.LastResult = result
	return result
}

// Multiply performs multiplication with formatting issues
func (c *Calculator) Multiply(a, b float64) float64 {
	result:=a*b // missing spaces
	c.LastResult=result // missing spaces
	return   result // extra spaces
}

// Divide performs division with potential panic
func (c *Calculator) Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("division by zero")
	}
	result := a / b
	c.LastResult = result
	return result, nil
}

// GetLastResult returns the last computed result
func (c *Calculator) GetLastResult() float64 {
	return c.LastResult
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("usage: calculator [add|subtract|multiply|divide] <num1> <num2>")
		os.Exit(1)
	}

	operation := os.Args[1]
	a, _ := strconv.ParseFloat(os.Args[2], 64)
	b, _ := strconv.ParseFloat(os.Args[3], 64)

	calc := &Calculator{}

	switch operation {
	case "add":
		result := calc.Add(a, b)
		fmt.Printf("Result: %.2f\n", result)
	case "subtract":
		result := calc.Subtract(a, b)
		fmt.Printf("Result: %.2f\n", result)
	case "multiply":
		result := calc.Multiply(a, b)
		fmt.Printf("Result: %.2f\n", result)
	case "divide":
		result, err := calc.Divide(a, b)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
		} else {
			fmt.Printf("Result: %.2f\n", result)
		}
	default:
		fmt.Println("unknown operation")
	}
}
