let shapeClassifier;
let canvas;
let resultsDiv;
let inputImage;
let clearButton;

function setup() {
  canvas = createCanvas(600, 600);
  pixelDensity(1);
  let options = {
    task: 'imageClassification',
  };
  shapeClassifier = ml5.neuralNetwork(options);
  const modelDetails = {
    model: 'model.json',
    metadata: 'model_meta.json',
    weights: 'model.weights.bin',
  };
  shapeClassifier.load(modelDetails, modelLoaded);

  background(255);
  clearButton = createButton('clear');
  clearButton.mousePressed(function() {
    background(255);
  });
  resultsDiv = createDiv('loading model');
  inputImage = createGraphics(64, 64);
}

function modelLoaded() {
  console.log('model ready!');
  classifyImage();
}

function classifyImage() {
  inputImage.copy(canvas, 0, 0, 600, 600, 0, 0, 64, 64);
  shapeClassifier.classify(
    {
      image: inputImage,
    },
    gotResults
  );
}

function gotResults(err, results) {
  if (err) {
    console.error(err);
    return;
  }
  let label = results[0].label;
  let confidence = nf(100 * results[0].confidence, 2,1);
  console.log(results[1].confidence)
  resultsDiv.html(`${label} ${confidence}%`);
  console.log(results[0],results[1],results[2]);
  classifyImage();

}

function draw() {
  if (mouseIsPressed) {
    strokeWeight(18);
    line(mouseX, mouseY, pmouseX, pmouseY);
  }

  // stroke(0);
  // noFill();
  // strokeWeight(4);
  // rectMode(CENTER);
  // rect(width/2, height/2, 40);
}
