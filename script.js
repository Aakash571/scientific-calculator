// script.js
function appendValue(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function backspace() {
    let display = document.getElementById("display");
    display.value = display.value.slice(0, -1);
}

function factorial(n) {
    if (n === 0) {
        return 1;
    } else if (n < 0) {
        return NaN;
    } else {
        let result = 1;
        for (let i = 1; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

function calculate() {
    try {
        let expression = document.getElementById("display").value;

        // 1. Replace special characters and functions (EARLY REPLACEMENT):
        expression = expression.replace('√', 'Math.sqrt');
        expression = expression.replace('π', Math.PI);
        expression = expression.replace('e', Math.E);
        expression = expression.replace('sin(', 'Math.sin(');
        expression = expression.replace('cos(', 'Math.cos(');
        expression = expression.replace('tan(', 'Math.tan(');
        expression = expression.replace('log(', 'Math.log10(');
        expression = expression.replace('ln(', 'Math.log(');

        // 2. Factorial:
        expression = expression.replace(/(\d+)!/g, (match, num) => factorial(parseInt(num)));

        // 3. Square Function (using ^ for squaring):
        expression = expression.replace(/(\d+)\^2/g, (match, num) => Math.pow(parseFloat(num), 2)); // num^2

        // 4. Power Function (using ^ for general powers):
        expression = expression.replace(/(\d+)\^(\d+)/g, (match, base, exp) => Math.pow(parseFloat(base), parseFloat(exp))); // base^exp


        // 5. BODMAS Evaluation (using the corrected evaluate function):
        let result = evaluate(expression);

        document.getElementById("display").value = result;

    } catch (e) {
        document.getElementById("display").value = "Error";
        console.error("Calculation Error:", e); // Keep this for debugging!
    }
}


// BODMAS Evaluation Function (Recursive Descent Parser) - CORRECTED
function evaluate(expression) {
    const tokens = expression.match(/(\d+(\.\d*)?)|[+\-*/^()!√]/g); // Include √ in the regex

    if (!tokens) {
        return 0;
    }

    let index = 0;

    function parseExpression() {
        let left = parseTerm();

        while (index < tokens.length && (tokens[index] === '+' || tokens[index] === '-')) {
            const operator = tokens[index];
            index++;
            const right = parseTerm();
            left = applyOperator(left, operator, right);
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();

        while (index < tokens.length && (tokens[index] === '*' || tokens[index] === '/')) {
            const operator = tokens[index];
            index++;
            const right = parseFactor();
            left = applyOperator(left, operator, right);
        }
        return left;
    }

    function parseFactor() {
        let token = tokens[index];

        if (token === '(') {
            index++;
            const result = parseExpression();
            if (tokens[index] === ')') {
                index++;
                return result;
            } else {
                throw new Error("Missing closing parenthesis");
            }
        } else if (token.match(/(\d+(\.\d*)?)/)) {
            index++;
            return parseFloat(token);
        } else if (token === '√') {
            index++;
            return Math.sqrt(parseFactor()); // Correctly handle sqrt
        } else if (token === '^') {  // Power is handled in calculate()
            throw new Error("Power operator ^ should be handled in calculate()");
        } else if (token === '!') {
            index--;
            return factorial(parseFactor()); // Correctly handle factorial
        }
        else {
            throw new Error("Invalid token: " + token);
        }
    }

    function applyOperator(left, operator, right) {
        switch (operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: throw new Error("Invalid operator");
        }
    }

    return parseExpression();
}