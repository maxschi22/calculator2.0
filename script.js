// Selektoren
const add = document.querySelector(".add");
const sub = document.querySelector(".sub");
const multiply = document.querySelector(".multiply");
const divide = document.querySelector(".divide");
const display = document.querySelector(".display");
const inputFields = document.querySelectorAll(".input");
const operators = document.querySelectorAll(".operation");
const equal = document.querySelector(".equal");
const decimal = document.querySelector(".decimal");
const clearButton = document.querySelector(".clear");
const logTable = document.querySelector(".log");
const clearLogButton = document.querySelector(".clearLog");

//EvenListener
document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keydown", deleteLastInput);
inputFields.forEach((input) => {
  input.addEventListener("click", handleInputClick);
});
clearButton.addEventListener("click", clearInput);
equal.addEventListener("click", handleEqualClick);
clearLogButton.addEventListener("click", clearLog);

//Operatoren deaktivieren solange noch keine Zahl eingegeben wurde
disableOperators(true);

//Funktion zum deaktivieren/aktivieren von Operatoren
function disableOperators(mode) {
  operators.forEach((operator) => {
    operator.disabled = mode;
  });
  equal.disabled = mode;
  decimal.disabled = mode;
}

//Überprüfung ob letzter Char ein Operator oder ein Punkt ist
function isLastCharOperatorOrDot(lastChar) {
  return ["+", "*", "/", "."].includes(lastChar); // "-" entfernt
}

// Key Handling
function handleKeyPress(event) {
  let lastChar = display.textContent.slice(-1);
  const key = event.key;

  if (event.key >= "0" && event.key <= "9") {
    display.textContent += key;
  } else if (
    event.key === "+" ||
    event.key === "-" ||
    event.key === "*" ||
    event.key === "/"
  ) {
    if (isLastCharOperatorOrDot(lastChar)) {
      throw new Error("Auf einen Operator kann kein Operator folgen");
    }
    display.textContent += key;
  } else if (event.key === "Enter") {
    handleEqualClick();
  } else if (event.key === "Escape" || event.key === "Delete") {
    clearInput();
  } else if (event.key === "." || event.key === ",") {
    if (isLastCharOperatorOrDot(lastChar)) {
      throw new Error("Auf einen Operator kann kein Operator folgen");
    } else {
      display.textContent += ".";
    }
  }
}

//Eingaben anzeigen
function handleInputClick(event) {
  const value = event.target.textContent;
  display.textContent += value; // Wert an den Display anhängen

  // Überprüfen, ob der letzte Charakter ein Operator oder ein leerer String ist
  const lastChar = display.textContent.charAt(display.textContent.length - 1);
  const isEmpty = display.textContent.trim() === "";

  // Operatoren basierend auf dem letzten Zeichen aktivieren oder deaktivieren
  if (!isEmpty && !isLastCharOperatorOrDot(lastChar)) {
    disableOperators(false);
    if (!/[+\-*/]/.test(display.textContent)) {
      equal.disabled = true;
    } else {
      equal.disabled = false;
    }
  } else {
    disableOperators(true);
  }
}

// Ausführung von Operationen
function handleEqualClick() {
  const calculation = display.textContent;
  const { numbers, operators } = getFormula(calculation);
  console.log(numbers);
  if (numbers.length < 2 || numbers.includes(NaN)) {
    throw new Error("Es müssen mindestens 2 Zahlen gegeben sein!");
  } else {
    const result = calculate(numbers, operators);
    display.textContent = result;
  }
}

// Display leeren
function clearInput() {
  disableOperators(true);
  display.textContent = "";
}

// Die Letzte eingabe auf dem Display rückgängig machen
function deleteLastInput(event) {
  if (event.key === "Backspace") {
    display.textContent = display.textContent.slice(0, -1);
  }
}

// Input in eine Formel umwandeln
function getFormula(expression) {
  const numbers = [];
  const operators = [];
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if ((char >= "0" && char <= "9") || char === ".") {
      currentNumber += char;
    } else if (char === "+" || char === "*" || char === "/") {
      // Zahl beenden und Operator hinzufügen
      if (currentNumber !== "") {
        numbers.push(parseFloat(currentNumber));
        currentNumber = "";
      }
      operators.push(char);
    } else if (char === "-") {
      // Unterscheidung: Operator oder Vorzeichen?
      if (
        i === 0 || // Am Anfang der Eingabe
        ["+", "-", "*", "/"].includes(expression[i - 1]) // Nach einem anderen Operator
      ) {
        currentNumber += char; // Als Vorzeichen behandeln
      } else {
        // Zahl beenden und Operator hinzufügen
        if (currentNumber !== "") {
          numbers.push(parseFloat(currentNumber));
          currentNumber = "";
        }
        operators.push(char);
      }
    }
  }

  if (currentNumber !== "") {
    numbers.push(parseFloat(currentNumber)); // Letzte Zahl hinzufügen
  }

  return { numbers, operators };
}

function clearLog() {
  loggedCalculations = 0;
  logTable.innerHTML = `
  <table class="loggingTable">
    <thead>
          <tr>
            <th>Geloggte Rechnungen</th>
          </tr>
    </thead>
    <tbody>
    </tbody>
  </table>`;
}

let loggedCalculations = 0;
// Operation loggen
function logCalculation(numbers, operators, result) {
  if (!logTable.innerHTML.trim()) {
    logTable.innerHTML = `
      <table class="loggingTable">
        <thead>
          <tr>
            <th>Geloggte Rechnungen</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>`;
    clearLogButton.removeAttribute("id");
  }

  const tbody = logTable.querySelector("tbody"); // Zugriff auf den Tabellenkörper

  // Dynamisch die gesamte Rechnung zusammensetzen
  let recentCalculation = `${numbers[0]}`; // Starte mit der ersten Zahl
  for (let i = 0; i < operators.length; i++) {
    recentCalculation += ` ${operators[i]} ${numbers[i + 1]}`; // Füge Operator und nächste Zahl hinzu
  }
  loggedCalculations++;
  // Füge die zusammengesetzte Rechnung als neue Zeile in die Tabelle ein
  const newRow = document.createElement("tr");
  newRow.innerHTML = `<td class="logging"> ${loggedCalculations}.Operation| ${recentCalculation} = ${result}</td>`;
  tbody.appendChild(newRow);
}

// Formel berechnen
function calculate(numbers, operators) {
  // Kopien der originalen Arrays für Logging erstellen
  const originalNumbers = [...numbers];
  const originalOperators = [...operators];

  // Zuerst Multiplikation und Division
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "*" || operators[i] === "/") {
      const result =
        operators[i] === "*"
          ? numbers[i] * numbers[i + 1]
          : numbers[i] / numbers[i + 1];

      // Ergebnis in das Array einfügen und die genutzten Werte entfernen
      numbers.splice(i, 2, result);
      operators.splice(i, 1);
      i--; // Index anpassen, da Arrays verkürzt wurden
    }
  }

  // Dann Addition und Subtraktion
  let result = numbers[0];
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "+") {
      result += numbers[i + 1];
    } else if (operators[i] === "-") {
      result -= numbers[i + 1];
    }
  }

  // Logging mit den ursprünglichen Arrays und dem berechneten Ergebnis
  logCalculation(originalNumbers, originalOperators, result);

  disableOperators(false);
  return result;
}
