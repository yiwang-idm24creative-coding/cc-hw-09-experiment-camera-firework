// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Webcam Image Classification using a pre-trained customized model and p5.js
This example uses p5 preload function to create the classifier
=== */

// Import the ml5.js library
let classifier;
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/6HrYHiuPY/';
let video;
let label = "";
let confidence = "";
let textLabel;
let fireworks = [];
let gravity;
let bgMusic;

// Call ML5 function: Load the model before sketch runs
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
  bgMusic = loadSound('bgmusic.mp3'); 
}

function setup() {
  createCanvas(640, 480);
  
  // Set up the video capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Start classifying
  classifier.classifyStart(video, gotResult);
  
  // Set up gravity for fireworks
  gravity = createVector(0, 0.1);

  // Add instructions to the DOM
  createP("clap your hand to let firework appear");
  createP("put your hand out of camera to stop firework");
    
  // Create a button to start the music
  let startButton = createButton("Start Music");
  startButton.position(10, height + 10);
  startButton.mousePressed(playMusic);  // Play music on button click
}

function playMusic() {
  if (bgMusic && !bgMusic.isPlaying()) {
    bgMusic.loop();  // Start playing and looping music
  }
}

function draw() {
  background(0);

  // Mirror the video and draw it to the canvas
  push();
  translate(width, 0); // Move the canvas origin to the right
  scale(-1, 1); // Flip horizontally
  image(video, 0, 0, width, height);
  pop();
  
  // Display the label
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(textLabel, 5, height - 4);
  
  // Control ball movement based on detected label
  if (label == "claphands") {
    textLabel = "Congratulations!";
    fireworks.push(new Firework());
  } else if (label == "still") {
    textLabel = "Still"
    fireworks = []; 
  }
  
  // Update and display fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

// Callback function for when classification has finished
function gotResult(results) {
  // Update label variable which is displayed on the canvas
  label = results[0].label;
  console.log(results);
}

// Firework class
class Firework {
  constructor() {
    this.firework = new Particle(random(width), height, true); 
    // main firework launching from bottom
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();
      if (this.firework.vel.y >= 0) { 
        // once firework starts coming down, explode it
        this.explode();
      }
    }

    // Update particles if exploded
    for (let particle of this.particles) {
      particle.applyForce(gravity);
      particle.update();
    }
  }

  explode() {
    this.exploded = true;

    // Create multiple particles to simulate explosion
    for (let i = 0; i < 100; i++) {
      let p = new Particle(this.firework.pos.x, this.firework.pos.y, false);
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    } else {
      for (let particle of this.particles) {
        particle.show();
      }
    }
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }
}

// Particle class to represent each individual particle
class Particle {
  constructor(x, y, isFirework) {
    this.pos = createVector(x, y);
    this.lifetime = 255;
    if (isFirework) {
      this.vel = createVector(0, random(-12, -8)); // firework initially launched upwards
    } else {
      this.vel = createVector(random(-3, 3), random(-3, 3)); // explosion particles with random direction
    }
    this.acc = createVector(0, 0);
    this.isFirework = isFirework;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0); // reset acceleration

    if (this.isFirework) {
      this.lifetime -= 4;
    } else {
      this.lifetime -= 2;
    }
  }

  show() {
    noStroke();
    fill(255, this.lifetime);
    ellipse(this.pos.x, this.pos.y, 5);
  }

  done() {
    return this.lifetime < 0;
  }
}