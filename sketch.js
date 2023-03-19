let typedText;
let targetText;
let targetChar;
let typedChar;
let targetWordCount;

let isWrong = [];

let startTime;
let totalInputs = 0;
let accuracy;
let wpm;
let record = [];

let hasStarted = false;

let winWidth = 480;
let txtSize = 13;

let car1;
let car2;
let car1Pos = 0;
let car2Pos = 0;

function getQuote(data) {
  quoteStart = data.indexOf("\"content\"") + 11;
  quoteEnd = data.indexOf("\"author\"") - 2;
  
  if (quoteStart > quoteEnd) {
    quoteEnd = data.indexOf("\"tags\"") - 2;
  }
  
  targetText = data.substring(quoteStart, quoteEnd);
  targetChar = targetText.split("");
  targetWordCount = targetChar.length;
}

function setup() {
  createCanvas(winWidth, winWidth / 16 * 9);
  
  //Get first quote
  httpGet("https://api.quotable.io/random?maxLength=60", getQuote);
  
  //Load sprites
  car1 = loadImage("Car.png");
  car2 = loadImage("Car.png");
  
  //CReate input field
  typedText = createInput();
  typedText.position(25, height/2);
  typedText.size(winWidth - 50);
}

function keyPressed() {
  //Restart
  if (keyCode == ENTER) {
    restart();
    return;
  }
  
  //Start timer
  if (!hasStarted) {
    hasStarted = true;
    startTime = millis();
  }
  
  //Keep count of key presses
  if (keyCode != ENTER || keyCode != SHIFT || keyCode != BACKSPACE) {
    totalInputs++;
  }
}

function restart() {
  //Get quote
  httpGet("https://api.quotable.io/random?maxLength=60", getQuote);
  
  //Reset input field
  typedText.value("");
  
  //Reset wpm
  startTime = 0;
  hasStarted = false;
  totalInputs = 0;
  
  //Reset sprites
  car1Pos = 0;
  car2Pos = 0;
}

function updateTrack() {
  push();
  
  //Track
  fill("gray");
  noStroke();
  rect(0, 25, width, height / 4);
  
  stroke(0, 0, 0);
  drawingContext.setLineDash([5, 10, 30, 10]);
  line(0, height / 8 + 25, width, height / 8 + 25);
  
  //Cars
  image(car1, car1Pos, height / 9.3, width / 48 * 5, width / 96 * 5);
  image(car2, car2Pos, height / 4.3, width / 48 * 5, width / 96 * 5);
  
  pop();
}

function draw() {
  background(255);
  
  //Display quote
  fill(0, 0, 0);
  textSize(txtSize);
  textWrap(WORD);
  text(targetText, 25, height / 2 - 35, winWidth - 50);
  
  //Display timer
  if (!hasStarted) {
    fill(0, 0, 0);
    textSize(txtSize);
    text("Timer starts when you start typing...", 25, height / 2 + 35);
  } else {
    fill(0, 0, 0);
    textSize(txtSize);
    text("Time: " + (int((millis() - startTime)/1000)), 25, height / 2 + 35);
  }
  
  //Display records
  fill(0, 0, 0);
  textSize(txtSize);
  text("Past Records: ", 25, height * 3 / 4)
  for (let i = 0; i < record.length; i++) {
    wpm = record[record.length - 1 - i][0];
    accuracy = record[record.length - 1 - i][1];
    text("WPM: " + wpm + "  ||  ACCURACY: " + accuracy + "%", 25, height * 3 / 4 + ((i +1) * txtSize));
  }
  
  //Calculate wpm and accuracy once finished
  typedChar = typedText.value().split("");
  
  if (typedText.value() == targetText) {
    accuracy = int((2 * targetChar.length - totalInputs) / targetChar.length * 100);
    wpm = int(typedText.value().split(" ").length / ((millis() - startTime) / 60000));
    
    append(record, [wpm, accuracy]);
    
    if (record.length > 5) {
      record = subset(record, 1);
    }
  
    restart();
    return;
  }
  
  //Find errors
  isWrong = [];
  for (let i = 0; i < typedChar.length; i++) {
    if (typedChar[i] != targetChar[i]) {
      append(isWrong, i);
    }
  }
  
  //Display correct
  textSize(txtSize);
  textWrap(WORD);
  
  if (hasStarted) {
    fill(0, 255, 0);
    if (isWrong.length != 0) {
      text(subset(targetChar, 0, isWrong[0]).join(""), 25, height / 2 - 35, winWidth - 50);  
    } else {
      text(subset(targetChar, 0, typedChar.length).join(""), 25, height / 2 - 35, winWidth - 50);  
    }  
  }
  
  //Display incorrect
  for (let i = 0; i < isWrong.length; i++) {
    fill(255, 0, 0);
    text(targetChar[isWrong[i]], 25 + textWidth(subset(targetChar, 0, isWrong[i]).join("")), height / 2 - 35, winWidth - 50);
  }
  
  //Display sprites
  if (hasStarted) {
    car1Pos = min(car1Pos + 0.4, width - 65);
    
    if (isWrong.length != 0) {
      car2Pos = isWrong[0] / targetWordCount * (width - 65);  
    } else {
      car2Pos = typedChar.length / targetWordCount * (width - 65);
    }
    
  }
  
  updateTrack();
}