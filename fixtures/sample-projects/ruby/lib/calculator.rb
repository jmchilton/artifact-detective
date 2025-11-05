class Calculator
  def add(a,b)
    # RuboCop violations: missing spaces
    a+b
  end

  def subtract(a, b)
    # Deliberate violation: inconsistent spacing
    a - b  # Extra spaces
  end

  def multiply(a, b)
    a * b
  end

  def divide(a, b)
    if b == 0
      raise ZeroDivisionError, "Cannot divide by zero"
    end
    a / b
  end

  def power(base, exp)
    base ** exp
  end

  def unused_variable
    x = 42 # RuboCop violation: unused local variable
    "result"
  end

  def no_type_hints(value)
    # StandardRB violation: missing type documentation
    value.to_s
  end

  def dangerous_eval
    # Brakeman security violation: eval is dangerous
    eval("puts 'hello'")
  end

  def long_method_name_to_exceed_line_length
    # This line exceeds the configured line length maximum and will trigger a style violation
    puts "This is a very long line that will trigger the line length violation in the linter"
  end
end
