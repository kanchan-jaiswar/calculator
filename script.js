let display = document.getElementById('display');
let currentInput = '0';
let previousInput = ''; // Store as string to preserve formatting
let operator = '';
let shouldResetDisplay = false;

// Update display
function updateDisplay() {
    let displayValue = '';
    
    // Show full expression if operator is set and we have a current input (not just operator selected)
    if (operator !== '' && previousInput !== '') {
        // Format previous input - remove trailing zeros
        let prevStr = previousInput.toString();
        // Remove trailing zeros after decimal point
        if (prevStr.includes('.')) {
            prevStr = prevStr.replace(/\.?0+$/, '');
        }
        
        // Convert * to × for display
        let displayOperator = operator;
        if (operator === '*') {
            displayOperator = '×';
        }
        
        // Only show current input if it's not just '0' (meaning user hasn't started typing new number yet)
        // Or if shouldResetDisplay is false (meaning user is typing)
        if (shouldResetDisplay && currentInput === '0') {
            // Just show previous number and operator, wait for next number
            displayValue = prevStr + ' ' + displayOperator;
        } else {
            // Show full expression: previousInput + operator + currentInput
            let currStr = currentInput;
            displayValue = prevStr + ' ' + displayOperator + ' ' + currStr;
        }
    } else {
        // Show only current input
        displayValue = currentInput;
    }
    
    // Limit display length to prevent overflow, but preserve decimal point input
    if (displayValue.length > 20 && !displayValue.endsWith('.')) {
        // For very long expressions, try to format numbers
        const parts = displayValue.split(' ');
        if (parts.length === 3) {
            // It's an expression, format individual numbers if needed
            let formattedParts = parts;
            const num1 = parseFloat(parts[0]);
            const num2 = parseFloat(parts[2]);
            if (!isNaN(num1) && parts[0].length > 10) {
                formattedParts[0] = num1.toExponential(5);
            }
            if (!isNaN(num2) && parts[2].length > 10) {
                formattedParts[2] = num2.toExponential(5);
            }
            displayValue = formattedParts.join(' ');
        } else {
            // Single number
            const num = parseFloat(displayValue);
            if (!isNaN(num)) {
                displayValue = num.toExponential(8);
            }
        }
    }
    
    display.textContent = displayValue;
    
    // Adjust font size for longer expressions
    if (displayValue.length > 12) {
        display.style.fontSize = '1.8rem';
    } else if (displayValue.length > 8) {
        display.style.fontSize = '2rem';
    } else {
        display.style.fontSize = '2.5rem';
    }
}

// Append number to display
function appendNumber(number) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }
    
    if (number === '.' && currentInput.includes('.')) {
        return; // Prevent multiple decimal points
    }
    
    if (currentInput === '0' && number !== '.') {
        currentInput = number;
    } else {
        currentInput += number;
    }
    
    updateDisplay(); // Will show full expression if operator is set
}

// Append operator
function appendOperator(op) {
    // Store current input as string to preserve formatting
    if (previousInput === '') {
        previousInput = currentInput;
    } else if (operator) {
        // Calculate previous operation first
        const result = calculateResult();
        // Format result
        let resultStr = String(result);
        // Remove trailing zeros
        if (resultStr.includes('.')) {
            resultStr = resultStr.replace(/\.?0+$/, '');
        }
        currentInput = resultStr;
        previousInput = resultStr; // Store as string
    }
    
    // Set operator and prepare for new input
    operator = op;
    shouldResetDisplay = true;
    // Reset current input to '0' so display shows only operator, not duplicate number
    currentInput = '0';
    updateOperatorButtons();
    updateDisplay(); // Update to show expression with operator (e.g., "5 + ")
}

// Calculate result
function calculate() {
    if (operator === '' || previousInput === '') {
        return;
    }
    
    const result = calculateResult();
    // Format result to remove unnecessary decimal places
    let resultStr = String(result);
    // Remove trailing zeros after decimal point
    if (resultStr.includes('.')) {
        resultStr = resultStr.replace(/\.?0+$/, '');
    }
    currentInput = resultStr;
    previousInput = '';
    operator = '';
    shouldResetDisplay = true;
    updateDisplay();
    updateOperatorButtons();
}

// Perform calculation
function calculateResult() {
    // Convert to numbers for calculation
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) {
        return parseFloat(currentInput) || 0;
    }
    
    let result;
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert('Cannot divide by zero!');
                return prev;
            }
            result = prev / current;
            break;
        default:
            return current;
    }
    
    // Round to avoid floating point precision issues
    return Math.round(result * 100000000) / 100000000;
}

// Clear all
function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    shouldResetDisplay = false;
    updateDisplay();
    updateOperatorButtons();
}

// Clear entry (current input only)
function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

// Delete last character
function deleteLast() {
    // If we're in the middle of an expression, only delete from current input
    if (operator !== '' && previousInput !== '') {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
    } else {
        // No operator, delete from current input
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
    }
    updateDisplay();
}

// Percentage function
function appendPercentage() {
    const num = parseFloat(currentInput);
    if (isNaN(num)) {
        return;
    }
    
    if (operator !== '' && previousInput !== '') {
        // If there's an operator, calculate percentage of previous number
        // e.g., 50 + 20% = 50 + (50 * 20/100) = 60
        const prev = parseFloat(previousInput);
        const percentageValue = (prev * num) / 100;
        
        // Update current input with the percentage value
        let resultStr = String(percentageValue);
        // Remove trailing zeros
        if (resultStr.includes('.')) {
            resultStr = resultStr.replace(/\.?0+$/, '');
        }
        currentInput = resultStr;
    } else {
        // No operator, just divide by 100
        // e.g., 50% = 0.5
        const percentageValue = num / 100;
        let resultStr = String(percentageValue);
        // Remove trailing zeros
        if (resultStr.includes('.')) {
            resultStr = resultStr.replace(/\.?0+$/, '');
        }
        currentInput = resultStr;
        previousInput = '';
        operator = '';
    }
    
    shouldResetDisplay = false;
    updateDisplay();
}

// Update operator buttons visual state
function updateOperatorButtons() {
    const operatorButtons = document.querySelectorAll('.btn-operator');
    operatorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === operator || 
            (operator === '*' && btn.textContent === '×') ||
            (operator === '/' && btn.textContent === '/')) {
            btn.classList.add('active');
        }
    });
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Numbers
    if (key >= '0' && key <= '9') {
        appendNumber(key);
        return;
    }
    
    // Decimal point
    if (key === '.' || key === ',') {
        appendNumber('.');
        return;
    }
    
    // Operators
    if (key === '+') {
        appendOperator('+');
        return;
    }
    if (key === '-') {
        appendOperator('-');
        return;
    }
    if (key === '*' || key === 'x' || key === 'X') {
        appendOperator('*');
        return;
    }
    if (key === '/') {
        event.preventDefault(); // Prevent browser search
        appendOperator('/');
        return;
    }
    
    // Equals
    if (key === '=' || key === 'Enter') {
        event.preventDefault();
        calculate();
        return;
    }
    
    // Clear
    if (key === 'Escape') {
        clearAll();
        return;
    }
    
    // Backspace
    if (key === 'Backspace') {
        event.preventDefault();
        deleteLast();
        return;
    }
    
    // Delete (clear entry)
    if (key === 'Delete') {
        clearEntry();
        return;
    }
    
    // Percentage
    if (key === '%' || (event.shiftKey && key === '5')) {
        event.preventDefault();
        appendPercentage();
        return;
    }
});

// Initialize display
updateDisplay();
