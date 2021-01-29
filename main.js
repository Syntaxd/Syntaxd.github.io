//THIS FILE IS TO BE STRIPPED OF IT'S FUNCITONS TO BE ORGANIZED INTO MODULES

var context, controller, player, loop;
var myScore;

context = document.querySelector("canvas").getContext("2d");
var CanH = 600;
var CanW = 1000;
context.canvas.height = CanH;
context.canvas.width = CanW;

var gameWidth = 2000;

const numTrails = 6;

function pointInBox (x, y, box) {
  if (x < box.x) {
    return false;
  } else if (x > (box.x + box.width)) {
    return false;
  } else if (y < box.y) {
    return false;
  } else if (y > (box.y + box.height)) {
    return false;
  }
  return true;
}

function boxCollision(box1, box2) {
  // console.log(box1)
  // console.log(box2)
  const x = box1.x + box1.width/2.;
  const y = box1.y + box1.height/2.;
  const outsideBox = {
    x: box2.x - box1.width/2.,
    y: box2.y - box1.height/2.,
    width: box2.width + box1.width,
    height: box2.height + box1.height,
  }
  // console.log('debug', box1, box2, pointInBox (x, y, outsideBox))
  return pointInBox (x, y, outsideBox)
}


function collision(player1, player2, box) {
  const x_min = Math.min(player1.x, player2.x);
  const y_min = Math.min(player1.y, player2.y);
  const x_max = Math.max(player1.x + player1.width, player2.x + player2.width);
  const y_max = Math.max(player1.y + player1.height, player2.y + player2.height);

  const largerPlayer = {
    x: x_min,
    y: y_min,
    width: x_max - x_min,
    height: y_max - y_min,
  }
  // console.log(largerPlayer)
  return boxCollision(largerPlayer, box);
}

player = {
  height:14,
  jumping:true,
  width:14,
  x:100, // center of the canvas
  x_velocity:0,
  y:250,
  y_velocity:0,
  x_cam:0
};

prevPlayer = {
  height:null,
  jumping:null,
  width:null,
  x:null,
  x_velocity:null,
  y:null,
  y_velocity:null,
};

controller = {
  left:false,
  right:false,
  up:false,

  keyListener:function(event) {
    var key_state = (event.type == "keydown")?true:false;

    switch(event.keyCode) {
      case 65:// left key
        controller.left = key_state;
      break;
      case 87:// up key
        controller.up = key_state;
      break;
      case 68:// right key
        controller.right = key_state;
      break;
    }
  }
};

// function randomRange(s, b) {
//   // console.log('Range From: ' + s + ' to ' + b)
//
//    var Rand1 = Math.floor(Math.random() * gameWidth - 1)
//    var MathR = (Math.random() * 1)
//       if (MathR > 1) {Rand2 = Rand1 - 100}
//       if (MathR < 1) {Rand2 = Rand1 + 100}
//         if (Rand2 < 0) {Rand1 += 100;  Rand2 = Rand2 + 100}
//         if (Rand2 > gameWidth) {Rand1 -= 100; Rand2 = Rand2 - 100}
//         // console.log(Rand1 + ' ' + Rand2)
//     return [Rand1, Rand2]
// }

function randomNumber(s, b) {
  return Math.floor(Math.random() * (b - s) + 1) + s
}

function generatePlatform(y, gameWidth) {
  const gapWidth = 100;
  let x = Math.random()*(gameWidth - 3*gapWidth)+ gapWidth;
  console.log(x+gapWidth, x+gapWidth + gameWidth - (x+gapWidth))
  return [
    {
    x: 0,
    y: y,
    width: x,
    height: 5,
  },
  {
    x: x+gapWidth,
    y: y,
    width: gameWidth - (x+gapWidth),
    height: 5,
  }
  ]
}

// console.log(randomRange(0, CanW-1));

gameMap = {blocks: [
    {x: 0,
    y: 950,
    width: 900,
    height: 50,},
]}

gameMap.blocks.push.apply(gameMap.blocks, generatePlatform(500, gameWidth))
gameMap.blocks.push.apply(gameMap.blocks, generatePlatform(400, gameWidth))
gameMap.blocks.push.apply(gameMap.blocks, generatePlatform(300, gameWidth))
gameMap.blocks.push.apply(gameMap.blocks, generatePlatform(200, gameWidth))
gameMap.blocks.push.apply(gameMap.blocks, generatePlatform(100, gameWidth))
console.log(gameMap.blocks)

const debug1 = [];
const debug2 = [];
const debug3 = [];

var timeIndex  = 0;
loop = function() {

  if (controller.up && player.jumping == false) {
    player.y_velocity -= 20;
    player.jumping = true;}


  if (!player.jumping || player.y_velocity > -4) {
    if (controller.left) {player.x_velocity -= 0.5;}
    if (controller.right) {player.x_velocity += 0.5;}
  player.x_velocity *= 0.9}; // friction


  player.y_velocity += 0.85 // up gravity (fall speed?)
  player.y_velocity *= 0.97;// friction (jump force?)
  player.y += player.y_velocity;
  if (player.x > 500 && controller.right) {
    player.x_cam -= player.x_velocity
  }
  if (player.x < 300 && controller.left) {
    player.x_cam -= player.x_velocity;
  }
    player.x += player.x_velocity;


  // physics

  // console.log(player.y)

  if (timeIndex%2 == 0) {
    debug3.push({...prevPlayer})
    while (debug3.length > numTrails) {
      debug3.shift();
    }
  }

  for (let x = 0; x < gameMap.blocks.length; x++) {
    block = gameMap.blocks[x];
    if(collision(player, prevPlayer, block)) {

      if (player.y_velocity < 0) {
        player.y_velocity = 0
        player.y = block.y + block.height + 1;
      } else {
        player.y_velocity = 0.;
        player.y = block.y - player.height - 1;
        player.jumping = false;
        // console.log('bounce', player.y_velocity, player.y)
      }

          debug1.push({...player})
      while (debug1.length > 2) {
        debug1.shift();
      }
      debug2.push({...prevPlayer})
      while (debug2.length > 2) {
        debug2.shift();
      }
    }
  }


  // if player is falling below floor line
  if (player.y > CanH - player.height) {
    player.jumping = false;
    player.y = CanH - player.height;
    player.y_velocity = 0;
  }

  if (player.x < 0) {
    //Prevents from going left
    player.x = 0
  } else if (player.x > (gameWidth - player.width)) {player.x = gameWidth - player.width} //Prevents from going right


  // console.log('draw', player.y)
  context.fillStyle = "#202020";
  context.fillRect(0, 0, CanW, CanH);// x, y, width, height

  // Draw the trail
  const deltax = player.width / numTrails / 2;
  let offset = 0.;
  for (let x = debug3.length - 1; x>=0; x--) {
    offset += deltax;
    rect = debug3[x];
    context.beginPath()
    context.strokeStyle = '#fff'
    context.lineWidth = '1';
    context.rect(rect.x + offset + player.x_cam, rect.y + offset, rect.width - 2.*offset, rect.height - 2.*offset)
    context.stroke();
  }

  context.fillStyle = "#ff0000";// hex for red
  context.fillRect(player.x + player.x_cam, player.y, player.width, player.height); // Red box
  context.fillStyle = "black"
  context.fillRect(player.x+8 + player.x_velocity/2 + player.x_cam,  player.y+5, 2, 2)
  context.fillRect(player.x+4 + player.x_velocity/2 + player.x_cam,  player.y+5, 2, 2)

  for (let x = 0; x < gameMap.blocks.length; x++) {
    context.fillStyle = 'lime'
    rect = gameMap.blocks[x];
    context.fillRect(rect.x + player.x_cam, rect.y, rect.width, rect.height)
  }


  timeIndex ++;

  prevPlayer = {
    ...player
  }

  // call update when the browser is ready to draw again
  window.requestAnimationFrame(loop);


};

window.addEventListener("keydown", controller.keyListener)
window.addEventListener("keyup", controller.keyListener);
window.requestAnimationFrame(loop);
