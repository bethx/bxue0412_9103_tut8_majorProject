// variables from group code
let circleDiameter;
let circles = []; // Array for big circles
let bgCircles = []; // Array for small red circles
let bgCircleAmount = 400;

// variables used to add noise
var colourNoise;
var wavyLineNoise;
var nestedRingNoise;
var smallCircleNoise;
var xoff;

// variables used to add outline effect to big circles
let smallCircleDiameter;
let circleSize;
let targetCircleSize;
const easing = 0.05;

// arrays for the X and Y coordinates for the orange lines
let wavylineX = [2.8, 8.9, 14.9, 0.7, 6.8, 12.7, 19.2, -0.3, 5.8, 11.5, 17.4, 4.3, 10, 16];
let wavylineY = [2.7, 1, 0, 8.9, 7.7, 6.8, 4.2, 15.2, 13.5, 12.8, 10.5, 19.5, 18.5, 17];

// Predefined colors for the big circles
let circleColors = [
  [210, 266, 248],
  [250, 181, 37],
  [255, 231, 233],
  [237, 213, 148],
  [220, 255, 237],
  [252, 179, 138],
  [239, 174, 49],
  [197, 254, 254],
  [251, 222, 131],
  [255, 235, 245],
  [255, 249, 239],
  [255, 247, 248],
  [255, 208, 139],
  [253, 220, 62]
];

/* function to create the lines in the background
This code was adapted from https://editor.p5js.org/zygugi/sketches/BJHK3O_yM */
function wavyLines(linesX, linesY, lineWeight, lineR, lineG, lineB, radiusFactor) {
  noFill();
  stroke(lineR, lineG, lineB);
  strokeWeight(lineWeight);

  beginShape();
  xoff = 0;
  let noiseY = 0.05;
  let radius = (windowHeight / 20) * radiusFactor;

  for (var a = 0; a < TWO_PI; a += 0.1) {
    var offset = map(noise(xoff, noiseY), 0, 1, -15, 5);
    var r = radius + offset;
    var x = (windowHeight/20)*linesX + 0.8*r * cos(a);
    var y = (windowHeight/20)*linesY + 0.8*r * sin(a);
    vertex(x, y);
    xoff += 0.5;
  }
  endShape();
}

// Class for small random background circles
class bgCirclePattern {
  constructor(xPos, yPos, radius) {
    this.xPos = xPos;
    this.yPos = yPos;
    this.radius = radius;
  }

  // Individual code: added noise to the green and blue to make the background circles change colour
  display() {
    let bgCircleG = 255 * noise(colourNoise+5);
    let bgCircleB = 5 * noise(colourNoise+5);
    fill(230, bgCircleG, bgCircleB);
    stroke(255, 100, 100);
    strokeWeight(1);
    circle(this.xPos, this.yPos, this.radius * 2);
  }
}

// Class for the biggest Circle Pattern
class CirclePattern {
  constructor(xFactor, yFactor, color) {
    this.xFactor = xFactor;
    this.yFactor = yFactor;
    this.smallCircles = this.generateRandomSmallCircles();
    this.colour = color;

    // Generate random colors for nested circles
    this.r2Color = [random(0, 255), random(0, 255), random(0, 255)];
    this.r3Color = [random(0, 255), random(0, 255), random(0, 255)];
    this.r4Color = [random(0, 255), random(0, 255), random(0, 255)];

    // Generate random colors for additional rings
    this.additionalRingColors = []; // Array for storing colors
    for (let i = 0; i < 5; i++) {
      this.additionalRingColors.push([random(0, 255), random(0, 255), random(0, 255)]);
    }
  }

  display() {
    fill(this.colour);
    noStroke();
    let x = this.xFactor * windowHeight / 20;
    let y = this.yFactor * windowHeight / 20;
    circle(x, y, circleDiameter);

    // draw random small circles
    this.drawRandomSmallCircles();

    // draw nested circles
    this.drawNestedCircles(x, y);
  }

  drawNestedCircles(x, y) {
    // second circle
    let r2 = windowHeight / 20 * 1.5;
    fill(this.r2Color);
    stroke(255, 255,255) // Added white outline to emphasise movement of these circles
    strokeWeight(1)
    circle(x, y, r2 * 2);

    let r3 = windowHeight / 20 * 1.35;
    fill(this.r3Color);
    circle(x, y, r3 * 2);

    let ringRadii = [ // Radius of each circle between first circle 3 and circle 4
      windowHeight / 20 * 1.2,
      windowHeight / 20 * 1.0,
      windowHeight / 20 * 0.8,
      windowHeight / 20 * 0.6,
      windowHeight / 20 * 0.4,
    ];
    for (let i = 0; i < ringRadii.length; i++) {
      fill(this.additionalRingColors[i]); // Achieve different color fills by calling the data in the array
      circle(x, y, ringRadii[i] * 3 * noise(nestedRingNoise + i)); // Individual code: added noise to make the circle size change randomly
    }
  }

  /*Creates small random circles inside the larger circle
  This code was adapted from https://editor.p5js.org/slow_izzm/sketches/HyqLs-7AX */
  generateRandomSmallCircles() {
    let smallCircles = [];
    let x = this.xFactor * windowHeight / 20;
    let y = this.yFactor * windowHeight / 20;
    let radius = circleDiameter / 2;
    let smallCircleDiameter = windowHeight/90; // Smaller diameter
    let maxAttempts = 10000;
    let attempts = 0;

    while (smallCircles.length < 100 && attempts < maxAttempts) {
      let angle = random(TWO_PI);
      let distance = random(radius - smallCircleDiameter / 2);
      let randX = x + distance * cos(angle);
      let randY = y + distance * sin(angle);
      let randColor = color(random(255), random(255), random(255));
      let newCircle = { x: randX, y: randY, color: randColor };

      if (this.isValidPosition(newCircle, smallCircles, smallCircleDiameter)) {
        smallCircles.push(newCircle);
      }

      attempts++;
    }

    return smallCircles;
  }

  // Checks if the small circles will overlap with others
  isValidPosition(newCircle, smallCircles, diameter) {
    for (let circle of smallCircles) {
      let distance = dist(newCircle.x, newCircle.y, circle.x, circle.y);
      if (distance < diameter) {
        return false;
      }
    }
    return true;
  }

  drawRandomSmallCircles() {
    let smallCircleDiameter = windowHeight/90; // Smaller size of small circles
    noStroke(); // Remove stroke
    for (let smallCircle of this.smallCircles) {
      fill(smallCircle.color);
      circle(smallCircle.x, smallCircle.y, smallCircleDiameter * noise(smallCircleNoise)); 
      //Individual code: added noise to the diameter so that they change size
    }
  }

  getX() {
    return this.xFactor * windowHeight / 20;
  }

  getY() {
    return this.yFactor * windowHeight / 20;
  }
}

function setup() {
  createCanvas(windowHeight, windowHeight);
  background(5, 89, 127);

  // sets up variables to add noise
  wavyLineNoise = 0;
  colourNoise = 0;
  nestedRingNoise = 0;
  smallCircleNoise = 0;

  circleDiameter = (windowHeight / 20) * 5.5;

  // sets up variables for big circle outline animation
  circleSize = circleDiameter;
  targetCircleSize = circleSize + 20;

  // Initialize circles with their respective positions and colors
  for (let i = 0; i < wavylineX.length; i++) {
    circles.push(new CirclePattern(wavylineX[i], wavylineY[i], circleColors[i]));
  }

  /* Create small background circles
This code was adapted from https://www.youtube.com/watch?v=XATr_jdh-44&t=122s */
  for (let i = 0; i < bgCircleAmount; i++) {
    let overlapping = true;
    let bgCircle;
    while (overlapping) {
      overlapping = false;
      bgCircle = new bgCirclePattern(random(width), random(height), random(0, 10));

      // Check for overlap with other small red circles
      for (let other of bgCircles) {
        let d = dist(bgCircle.xPos, bgCircle.yPos, other.xPos, other.yPos);
        if (d < bgCircle.radius + other.radius) {
          overlapping = true;
          break;
        }
      }

      // Check for overlap with big circles
      for (let bigCircle of circles) {
        let d = dist(bgCircle.xPos, bgCircle.yPos, bigCircle.getX(), bigCircle.getY());
        if (d < bgCircle.radius + circleDiameter / 2 + 15) {
          overlapping = true;
          break;
        }
      }
    }
    bgCircles.push(bgCircle);
  }
}

function draw() {
  background(5, 89, 127, 5);
  /* Lowered background opacity so that past frames can be seen, 
  which enhances the animation's movement 
  This technique was sourced from https://genekogan.com/code/p5js-perlin-noise/*/


    // Draw all small background circles
    for (let bgCircle of bgCircles) {
      bgCircle.display();
    }

  // draw pink wavy lines
  // Individual code: added noise to the X coordinate so that it moves around 
  for (let t = 0; t < wavylineX.length; t++) {
    wavyLines(wavylineX[t] * noise(wavyLineNoise), wavylineY[t], 2, 244, 198, 226, 10);
  }

  // draw blue wavy lines
    // Individual code: added noise to the X coordinate so that it moves around 
  for (let t = 0; t < wavylineX.length; t++) {
    wavyLines(wavylineX[t], wavylineY[t] * noise(wavyLineNoise), 1, 134, 198, 226, 4.2);
  }

  // draws particles in the background to create some texture
  particles();

  // draws function for the circle outline animation
  circleMoving(10, 20);

  // Draw all big circles
   for (let circle of circles) {
    circle.display();
  } 

  // updates the noise to create movement
  colourNoise = colourNoise + 0.01;
  wavyLineNoise = wavyLineNoise + 0.002;
  nestedRingNoise = nestedRingNoise + 0.01;
  smallCircleNoise = smallCircleNoise + 0.03;
  }

function windowResized() {
  resizeCanvas(windowHeight, windowHeight);
  circleDiameter = (windowHeight / 20) * 5.5; 
  smallCircleDiameter = windowHeight/90;
 // Recalculate circle diameters after resize
  draw(); // Redraw circles to reflect the new dimensions
}

// function to draw pink particles 
function particles() {
  for (let x = 0; x < width; x++) {
    stroke(255, 50, 150);
    strokeWeight(2);
    point(x, random(height));
  }
}

/* Function to create a moving circle outline with easing 
Gives the impression that the big circle is pulsing */
function circleMoving(smallestCircle, biggestCircle) {

  if (frameCount % 60 == 0) {
    targetCircleSize = random(circleDiameter - smallestCircle, circleDiameter + biggestCircle);
  }

  for (let t = 0; t < wavylineX.length; t++) {
    stroke(circleColors[t]);
    circle((windowHeight/20)*wavylineX[t], (windowHeight/20)*wavylineY[t], circleSize)
  }

  circleSize = lerp(circleSize, targetCircleSize, easing);
}
