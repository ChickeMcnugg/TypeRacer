let typedText;
let targetText;
let targetChar;
let typedChar;

let isWrong = false;

let startTime;
let totalInputs = 0;
let accuracy, wpm;
let record = [];

let hasStarted = false;

function getQuote(data) {
  quoteStart = data.indexOf("\"content\"") + 11;
  quoteEnd = data.indexOf("\"author\"") - 2;
  
  if (quoteStart > quoteEnd) {
    quoteEnd = data.indexOf("\"tags\"") - 2;
  }
  
  targetText = data.substring(quoteStart, quoteEnd);
  print(targetText);
  print(targetText.length);
  print(data);
  targetChar = targetText.split("");
}

function setup() {
  createCanvas(500, 500);
  httpGet("https://api.quotable.io/random?maxLength=120", getQuote);
  
  typedText = createInput();
  typedText.position(22, 250);
  typedText.size(450, 20);
}

function keyPressed() {
  if (keyCode == ENTER) {
    restart();
    return;
  }
  
  if (!hasStarted) {
    hasStarted = true;
    startTime = millis();  
  }
  
  if (keyCode != ENTER || keyCode != SHIFT || keyCode != BACKSPACE) {
    totalInputs++;
  }
}

function restart() {
  httpGet("https://api.quotable.io/random", getQuote);
  typedText.value("");
  startTime = 0;
  hasStarted = false;
  totalInputs = 0;
}

function draw() {
  background(255);
  
  fill(0, 0, 0);
  textSize(20);
  textWrap(WORD);
  text(targetText, 25, 50, 450);
  
  if (!hasStarted) {
    fill(0, 0, 0);
    textSize(20);
    text("Timer starts when you start typing...", 25, 310);
  } else {
    fill(0, 0, 0);
    textSize(20);
    text("Time: " + (int((millis() - startTime)/1000)), 25, 310);  
  }
  
  
  fill(0, 0, 0);
  textSize(20);
  text("Past Records: ", 25, 355)
  for (let i = 0; i < record.length; i++) {
    wpm = record[record.length - 1 - i][0];
    accuracy = record[record.length - 1 - i][1];
    text("WPM: " + wpm + "  ||  ACCURACY: " + accuracy + "%", 25, 375 + (i * 20));
  }
  
  typedChar = typedText.value().split("");
  
  if (typedText.value() == targetText) {
    wpm = int(targetText.split(" ").length / ((millis() - startTime) / 60000));
    accuracy = int((2 * targetChar.length - totalInputs) / targetChar.length * 100);
    
    append(record, [wpm, accuracy]);
    
    if (record.length > 5) {
      record = subset(record, 1);
    }
  
    restart();
    return;
  }
  
  isWrong = false;
  firstWrong = typedChar.length;
  
  for(let i = 0; i < typedChar.length; i++) {
    if (typedChar[i] != targetChar[i]) {
      firstWrong = i;
      isWrong = true;
      return;
    }
  }
  
  textSize(20);
  textWrap(WORD);
  fill(0,255,0);
  text(subset(typedChar, 0, firstWrong).join(""), 25, 50, 450);
}