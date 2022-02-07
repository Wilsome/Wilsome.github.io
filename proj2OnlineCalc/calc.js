window.onkeypress = (keyEvent) => {
    // Check for 'enter' key to click equals as the text content is '=' not 'Enter'.
    if (keyEvent.keyCode === 13) {
        document.getElementById('equal').click();
    }

    // Loop through all buttons to match up inner text with the key pressed.
    var calcButtons = document.getElementById('calcButtonsContainer');
    for (var i = 0; i < calcButtons.children.length; i++) {
        if (calcButtons.children[i].textContent === keyEvent.key) {
            calcButtons.children[i].click();
            return;
        }
    }
}

window.onkeydown = (keyEvent) => {
    // backspace pushed down.
    if (keyEvent.keyCode === 8) {
        document.getElementById('btnBack').click();
    }
    else if (keyEvent.key === 'Delete') {
        document.getElementById('btnAC').click();
    }
}

const display = document.getElementById('display');
var firstValue = '';
var secondValue = '';
var currentOperator;

function refreshDisplay() {
    if (typeof(currentOperator) === 'undefined') {
        display.textContent = firstValue;
    }
    else {
        display.textContent = firstValue + currentOperator + secondValue;
    }
}

function onCalcKeyPressed(btn) {
    if (btn.id === 'btnAC') {
        firstValue = '';
        secondValue = '';
        currentOperator = undefined;
        refreshDisplay();
    }
    else if (btn.id === 'btnBack') {
        if (typeof(currentOperator) === 'undefined') {
            // first value
            firstValue = firstValue.substring(0, firstValue.length - 1);
        }
        else {
            // second value
            if (secondValue === '') {
                currentOperator = undefined;
            }
            else {
                secondValue = secondValue.substring(0, secondValue.length - 1);
            }
        }

        refreshDisplay();
    }

    switch (btn.textContent)
    {
        case '0' : appendValue(btn.textContent);
            break;
        case '1' : appendValue(btn.textContent);
            break;
        case '2' : appendValue(btn.textContent);
            break;
        case '3' : appendValue(btn.textContent);
            break;
        case '4' : appendValue(btn.textContent);
            break;
        case '5' : appendValue(btn.textContent);
            break;
        case '6' : appendValue(btn.textContent);
            break;
        case '7' : appendValue(btn.textContent);
            break;
        case '8' : appendValue(btn.textContent);
            break;
        case '9' : appendValue(btn.textContent);
            break;
        case '.' : appendValue(btn.textContent, false);
            break;
        case '-' : calculate(btn.textContent);
            break;
        case '+' : calculate(btn.textContent);
            break;
        case '*' : calculate(btn.textContent);
            break;
        case '/' : calculate(btn.textContent);
            break;
        case '=' : calculate(undefined);
            break;
    }
}

function appendValue(val, allowDuplicates = true) {
    if (typeof(currentOperator) === 'undefined') {
        // first value
        if (allowDuplicates || firstValue.indexOf(val) === -1) {
            firstValue += val;
        }
    }
    else {
        // second value
        if (allowDuplicates || secondValue.indexOf(val) === -1) {
            secondValue += val;
        }
    }

    refreshDisplay();
}

function calculate(op)
{
    if (typeof(currentOperator) === 'undefined') {
        // working on first number
        currentOperator = op;
        firstValue = getValue(firstValue).toString();
        refreshDisplay();
    }
    else {
        calculateSolution(op);
    }
}

function calculateSolution(op) {
    let valueA = getValue(firstValue);
    let valueB = getValue(secondValue);
    switch (currentOperator) {
        case '-' : firstValue = (valueA - valueB).toString();
            break;
        case '+' : firstValue = (valueA + valueB).toString();
            break;
        case '*' : firstValue = (valueA * valueB).toString();
            break;
        case '/' : firstValue = (valueA / valueB).toString();
            break;
    }

    secondValue = '';
    currentOperator = op;
    refreshDisplay();
}

function getValue(stringValue) {
    let result = Number(stringValue);
    if (isNaN(result)) {
        return 0;
    }

    return result;
}

(function () {
    var calcButtons = document.getElementById('calcButtonsContainer');
    for (var i = 0; i < calcButtons.children.length; i++) {
        calcButtons.children[i].onclick = function () {
            onCalcKeyPressed(this);
        }
    }
   
}());