require 'spec_helper'
require_relative '../lib/calculator'

RSpec.describe Calculator do
  describe '#add' do
    it 'adds two numbers correctly' do
      calc = Calculator.new
      expect(calc.add(2, 3)).to eq(5)
    end

    it 'returns 0 when adding to zero' do
      calc = Calculator.new
      expect(calc.add(0, 5)).to eq(5)
    end

    it 'handles negative numbers' do
      calc = Calculator.new
      expect(calc.add(-2, 3)).to eq(1)
    end
  end

  describe '#subtract' do
    it 'subtracts two numbers correctly' do
      calc = Calculator.new
      expect(calc.subtract(5, 2)).to eq(3)
    end

    it 'intentionally fails to demonstrate failure' do
      calc = Calculator.new
      expect(calc.subtract(5, 2)).to eq(2) # Wrong expectation
    end
  end

  describe '#multiply' do
    it 'multiplies two numbers correctly' do
      calc = Calculator.new
      expect(calc.multiply(3, 4)).to eq(12)
    end
  end

  describe '#divide' do
    it 'divides two numbers correctly' do
      calc = Calculator.new
      expect(calc.divide(10, 2)).to eq(5)
    end

    it 'raises error on division by zero' do
      calc = Calculator.new
      expect { calc.divide(10, 0) }.to raise_error(ZeroDivisionError)
    end

    it 'fails deliberately due to missing method' do
      calc = Calculator.new
      expect(calc.divide(10, 2)).to eq(5.0)
    end
  end

  describe '#power' do
    it 'calculates power correctly' do
      calc = Calculator.new
      expect(calc.power(2, 3)).to eq(8)
    end

    xit 'skipped test for future implementation' do
      calc = Calculator.new
      expect(calc.power(2, 3)).to eq(8)
    end
  end
end
