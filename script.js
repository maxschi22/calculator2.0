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
const clearBtn = document.querySelector(".clear");
const logTable = document.querySelector(".log");
const clearLogBtn = document.querySelector(".clearLog");
const modal = document.getElementById("myModal");
const openModalBtn = document.getElementsByClassName("openModalBtn")[0];
const span = document.getElementsByClassName("close")[0];
const snackBar = document.getElementById("snackbar");
const square = document.querySelector(".square");

//EvenListener
document.addEventListener("keydown", handleKeyPress);
inputFields.forEach((input) => {
  input.addEventListener("click", handleInputClick);
});
clearBtn.addEventListener("click", clearInput);
square.addEventListener("click", toSquare);
equal.addEventListener("click", handleEqualClick);
clearLogBtn.addEventListener("click", clearLog);
openModalBtn.addEventListener("click", showModal);
span.addEventListener("click", hideModal);
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    hideModal();
  }
});

//TODO . darf nur einmal in einer Zahlenfolge vorkommen, wird bisher noch nicht behandelt.
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
  return ["+", "*", "/", ".", "-"].includes(lastChar);
}

// Key Handling
function handleKeyPress(event) {
  let lastChar = display.textContent.slice(-1);
  const key = event.key;

  if (event.key === "Backspace") {
    display.textContent = display.textContent.slice(0, -1);
  } else if ((event.key == "(") | (event.key == ")")) {
    display.textContent += key;
  } else if (event.key >= "0" && event.key <= "9") {
    display.textContent += key;
  } else if (
    event.key === "+" ||
    event.key === "-" ||
    event.key === "*" ||
    event.key === "/"
  ) {
    if (isLastCharOperatorOrDot(lastChar)) {
      display.textContent = display.textContent.slice(0, -1) + key;
    } else {
      display.textContent += key;
    }
  } else if (event.key === "Enter") {
    handleEqualClick();
  } else if (event.key === "Escape" || event.key === "Delete") {
    clearInput();
  } else if (event.key === "." || event.key === ",") {
    if (isLastCharOperatorOrDot(lastChar)) {
      let error = "Auf einen Operator/Komma kann kein Komma folgen";
      throwError(error);
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
  const { numbers, operators } = getFormula(calculation); //destruktor extrahiert die Werte von getFormula
  console.log(numbers);
  if (numbers.length < 2 || numbers.includes(NaN)) {
    let error = "Es müssen mindestens 2 Zahlen gegeben sein!";
    throwError(error);
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

//Quadrieren
function toSquare() {
  number = display.textContent;
  numbers = [number, number];
  result = number * number;
  error = "Quadrieren nicht möglich: Unbekannte Ursache";

  if (!number.includes(["+", "-", "*", "/"])) {
    if (result == "0") {
      error = "Quadrieren nicht möglich: 0 kann nicht multipliziert werden";
      throwError(error);
    } else if (isNaN(result)) {
      error =
        "Quadrieren nicht möglich: Operationen können nicht Quadriert werden";
      throwError(error);
    }
    logCalculation(numbers, "*", result);
    display.textContent = result;
  } else {
    throwError(error);
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

  // Überprüfen, ob der letzte Operator in der Liste ein Operator ist, aber nur, wenn auch wirklich ein Operator vorhanden ist
  if (
    operators.length > 0 &&
    ["+", "-", "*", "/"].includes(operators[operators.length - 1]) &&
    numbers.length === operators.length // Es muss eine Zahl nach dem letzten Operator kommen
  ) {
    let error =
      "Die Eingabe endet mit einem Operator. Bitte überprüfen Sie die Eingabe!";
    throwError(error);
  }

  // Division durch 0 prüfen
  for (let i = 0; i < operators.length; i++) {
    if (operators[i] === "/" && numbers[i + 1] === 0) {
      let error = "Division durch 0 ist nicht erlaubt!";
      clearInput();
      throwError(error);
    }
  }

  return { numbers, operators };
}

function clearLog() {
  loggedCalculations = 0;
  logTable.innerHTML = `
  <table class="loggingTable">
    <thead>
            <th colspan="2">Geloggte Rechnungen</th>
    </thead>
    <tbody>
    </tbody>
  </table>`;
  hideModal();
  openModalBtn.id = "hideElement";
}

let loggedCalculations = 0;
// Operation loggen
function logCalculation(numbers, operators, result) {
  openModalBtn.removeAttribute("id"); // Logbutton aktivieren
  if (!logTable.innerHTML.trim()) {
    logTable.innerHTML = `
      <table class="loggingTable">
        <thead>
            <th colspan="2">Geloggte Rechnungen</th>
        </thead>
        <tbody>
        </tbody>
      </table>`;
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
  newRow.innerHTML = `<td class="logging"> ${loggedCalculations}.Operation</td><td class="logging"> ${recentCalculation} = ${result}</td>`;
  tbody.appendChild(newRow);
}

// Formel berechnen
function calculate(numbers, operators) {
  // Kopien der originalen Arrays für Logging erstellen
  const originalNumbers = [...numbers]; //per spread-operator daten aus dem array extrahieren
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
    operators[i] === "+"
      ? (result += numbers[i + 1])
      : (result -= numbers[i + 1]);
  }

  result = roundNumber(result, 2);
  // Logging mit den ursprünglichen Arrays und dem berechneten Ergebnis
  logCalculation(originalNumbers, originalOperators, result);

  disableOperators(false);
  equal.disabled = true;
  return result;
}

function showModal() {
  modal.style.display = "block";
}

function hideModal() {
  modal.style.display = "none";
}

//Feedback für Fehleingaben
function activateSnackbar(error) {
  snackBar.innerHTML = error;
  snackBar.className = "show";

  setTimeout(function () {
    snackBar.className = snackBar.className.replace("show", "");
  }, 3000);
}

//Error Ausgabe und logging in der console
function throwError(error) {
  activateSnackbar(error);
  throw new Error(error);
}

// Funktion zum Runden
function roundNumber(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}
