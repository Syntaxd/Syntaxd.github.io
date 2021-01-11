function newGameState() {
  return {
      'time': 0.,
      'lives': 3,
      'gameOver': false,
      'paused': false,
      'score': 0,
      'keys': { w: false, a: false, s: false, d: false },
      'player': null,
      'objects': [],
  }
};


// Effects class
// x, y - position
// r - radius
// s - TK
// rm - max radius
// c - TK
const Effect = function (x, y, r, s, c) { this.x = x; this.y = y; this.r = 0; this.rm = r; this.s = s, this.c = c };
Effect.prototype = {
  // update: function (c) {
  //     if (this.r >= this.rm) c();
  //     this.r += this.s
  // },
  update: function (c) {
      this.r += this.s
      if (this.r >= this.rm) return false;
      return true;
  },
    draw: function (d) {
        d.strokeStyle = this.c;
        d.lineWidth = 3;
        d.beginPath();
        d.arc(this.x, this.y, this.r < 0 ? 0 : this.r, 0, Math.PI * 2);
        d.stroke();
        d.closePath();
    }
};



((D) => {
    // Math library
    const M = Math;

    // Define the game state.
    let state = newGameState();

    let cw = 0;

    // Parmeters
    const timeDelta = 30.; // number of milliseconds to step


    const c = D.getElementById("gc"),
        bo = D.getElementById("bo"),
        d = c.getContext("2d");

        // key press listener
      const keyListener = e => {
          // Use WASD or cursor keys to move around
            let down = e.type == "keydown" ? true : false;
            // Up
            if (e.keyCode == 87 || e.keyCode == 38) {
              state.keys.w = down;
            }
            // Left
            if (e.keyCode == 65 || e.keyCode == 37) {
              state.keys.a = down;
            }
            // Down
            if (e.keyCode == 83 || e.keyCode == 40) {
              state.keys.s = down;
            }
            // Right
            if (e.keyCode == 68 || e.keyCode == 39) {
              state.keys.d = down;
            }
            if (e.keyCode == 32) {
              if (!down) {
                state.paused = !state.paused;
              }
            }
        },

        addEnemies = () => {

            const slowMissileSpeed = 3.;
            const slowMissileMaxTurn = 5.0;

            const medMissileSpeed = 6.;
            const medMissileMaxTurn = 1.5;

            const fastMissileSpeed = 9.;
            const fastMissileMaxTurn = 0.2;

            const secondsToBomb = 1.; // average number of seconds between bombs
            const secondsToMissile = 5.; // average number of seconds between missiles

            // Add bombs
            const threshold1 = 1. / ((secondsToBomb*1000.) / timeDelta);
            if (Math.random() < threshold1) {
                let loc = M.rand(0, c.width * c.height);
                let x = loc % c.width;
                let y = (loc - x) / c.width;
                bub[bub.length] = new Bomb(x, y, M.rand(25, 35), 3);
            }

            // Add missiles (slow)
            const threshold2 = 1. / ((secondsToMissile*1000.) / timeDelta);
            if (Math.random() < threshold2) {
                let loc = M.rand(0, c.width * c.height);
                let x = loc % c.width;
                let y = (loc - x) / c.width;
                mis[mis.length] = new mI(
                    M.rand(0, c.width), M.rand(0, 1) ? 0 : c.height,
                    slowMissileMaxTurn, slowMissileSpeed, 'orange');
            }

            // Add missiles (fast)
            const threshold3 = 1. / ((secondsToMissile*1000.) / timeDelta);
            if (Math.random() < threshold3 && state.time > 60.) {
                let loc = M.rand(0, c.width * c.height);
                let x = loc % c.width;
                let y = (loc - x) / c.width;
                mis[mis.length] = new mI(
                    M.rand(0, c.width), M.rand(0, 1) ? 0 : c.height,
                    medMissileMaxTurn, medMissileSpeed, 'red');
            }

            // Add missiles (fast)
            const threshold4 = 1. / ((secondsToMissile*1000.) / timeDelta);
            if (Math.random() < threshold4 && state.time > 120.) {
                let loc = M.rand(0, c.width * c.height);
                let x = loc % c.width;
                let y = (loc - x) / c.width;
                mis[mis.length] = new mI(
                    M.rand(0, c.width), M.rand(0, 1) ? 0 : c.height,
                    fastMissileMaxTurn, fastMissileSpeed, 'purple');
            }

        }


        M.dis = (x1, y1, x2, y2) => { return M.hypot(M.abs(x1 - x2), M.abs(y1 - y2)) };
        M.rand = (s, b) => { return M.floor(M.random() * (b - s) + 1) + s };
        M.rad = d => { return d * M.PI / 180 };

    // Set up the ke event listeners
    // addEventListener("keydown", e => keyListener(e));
    // addEventListener("keyup", e => keyListener(e));
    addEventListener("keydown", keyListener);
    addEventListener("keyup", keyListener);

    // Player class
    // x, y - position
    // r - radius
    // s - speed
    const Player = function (x, y) {
      this.x = x;
      this.y = y;
    };
    Player.prototype = {
        vel: { x: 0, y: 0 },
        r: 12,   // radius
        f: 0.6, // mommentum
        s: 3.5, // speed

        draw: function () {
            d.fillStyle = "orange";
            d.fillRect(this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
            // Player box
            d.fillStyle = "black";
            d.fillRect (this.x + this.vel.x / 1.25  - 5, this.y + this.vel.y / 1.25 - 6, 4, 4);
            d.fillRect (this.x + this.vel.x / 1.25 + 1, this.y + this.vel.y / 1.25 - 6, 4, 4);
            // Player eyes
        },
        //Draws the player
        move: function (keys) {
            // Diagonal update only by 1/sqrt(2) to maintain constant speed.
            let delta = this.s;
            if ((keys.w + keys.a + keys.s + keys.d) > 1) {
              delta = this.s / 1.4;
            }
            if (keys.w) this.vel.y -= delta;
            if (keys.s) this.vel.y += delta;
            if (keys.a) this.vel.x -= delta;
            if (keys.d) this.vel.x += delta;
            this.vel.x *= this.f;
            this.vel.y *= this.f;
            this.x += this.vel.x;
            this.y += this.vel.y;
        },
        ifHit: function () {
            state.objects[state.objects.length] = new Effect(this.x, this.y, this.r + 20, 2, "blue");
            state.lives--;

        }
    };

    // Bomb class
    // x, y - position
    // r - radius
    // s - TK
    // rm - TK
    // c - TK
    const Bomb = function (x, y, r, s) {
        this.x = x;
        this.y = y;
        this.r = 3;
        this.rm = r;
        this.s = s;
        this.c = 1;
        this.t = state.time;
    };
    const bombExplodeTime = 3.;  // Time until explosion
    const bombSafeTime = 2.;     // Time until activation
    Bomb.prototype = {

        active: function() {
            if (state.time - this.t > bombExplodeTime) {
                return true;
            } else {
                return false;
            }
        },

        safe: function() {
            if (state.time - this.t < bombSafeTime) {
                return true;
            } else {
                return false;
            }
        },

        update: function (c) {
            if (this.active()) {
                let vel = this.s * this.r <= state.player.r ? 0.06 : 1;
                if (this.r >= this.rm) this.c = -1;
                this.r += this.s * vel * this.c;
                if (this.r < 0) c();
            }
        },

        draw: function () {
            if (this.safe()) {
                d.fillStyle = "white";
            } else {
                d.fillStyle = this.active() ? "lime" : "yellow";
            }
            d.beginPath();
            d.arc(this.x, this.y, this.r < 0 ? 0 : this.r, 0, M.PI * 2);
            d.fill();
            d.closePath();
        }

    };

    // Missile class
    // x, y - position
    // r - radius
    // s - TK
    // ef - TK
    const mI = function (x, y, maxTurn, speed, color) {
        this.x = x; this.y = y; this.r = 7; this.speed = speed;
        this.maxTurn = maxTurn;
        this.color = color;
        // this.ef = (f + 150) % 900;
        this.direction = M.atan2(state.player.y - this.y, state.player.x - this.x);
        if (this.direction >= M.PI) {
            this.direction -= 2*M.PI;
        } else if (this.direction <= -M.PI) {
            this.direction += 2*M.PI;
        }

        // this.speed = missileSpeed;
        this.t = state.time;
    };
    const missileLife = 8; // Life of a missile in seconds
    mI.prototype = {
        alive: function() {
            if (state.time - this.t > missileLife) {
                return false;
            } else {
                return true;
            }
        },

        draw: function () {
            d.strokeStyle = this.color;
            d.fillStyle = "lime";
            d.lineWidth = 3;
            d.beginPath();
            d.arc(this.x, this.y, this.r, 0, M.PI * 2);
            d.fill();
            d.stroke();
            d.closePath();

            // DEBUG
            // let newDirection = M.atan2(state.player.y - this.y, state.player.x - this.x);
            // let tgtx = this.x + 20 * M.cos(newDirection)
            // let tgty  = this.y + 20 * M.sin(newDirection)
            // d.strokeStyle = 'lime';
            // d.lineCap = "round";
            // d.lineWidth = 2;
            // d.beginPath();
            // d.moveTo(this.x, this.y);
            // d.lineTo(tgtx, tgty);
            // d.stroke();
            // d.closePath();
            // tgtx = this.x + 50 * M.cos(this.direction)
            // tgty  = this.y + 50 * M.sin(this.direction)
            // d.beginPath();
            // d.moveTo(this.x, this.y);
            // d.lineTo(tgtx, tgty);
            // d.stroke();
            // d.closePath();


        },
        move: function (c) {
            if (!this.alive()) c();
            let sc = this.s / M.dis(state.player.x, state.player.y, this.x, this.y);

            // Turn the missile
            if (this.direction >= M.PI) {
                this.direction -= 2*M.PI;
            } else if (this.direction <= -M.PI) {
                this.direction += 2*M.PI;
            }

            let newDirection = M.atan2(state.player.y - this.y, state.player.x - this.x);
            let delta = newDirection - this.direction;
            if (delta >= M.PI) {
                delta -= 2*M.PI;
            } else if (delta <= -M.PI) {
                delta += 2*M.PI;
            }

            let maxTurn = this.maxTurn*timeDelta/1000.;
            if (delta <= M.PI/2. && delta >= -M.PI/2.) {
                maxTurn = maxTurn / 2.;
            }
            if (delta >= 0 && delta > maxTurn) {
                delta = maxTurn;
            } else if (delta <= 0 && delta < -maxTurn) {
                delta = -maxTurn;
            }
            this.direction += delta;
            if (this.direction >= M.PI) {
                this.direction -= 2*M.PI;
            }
            if (this.direction >= -M.PI) {
                this.direction += 2*M.PI;
            }

            this.x = this.x + this.speed * M.cos(this.direction)
            this.y = this.y + this.speed * M.sin(this.direction)

            // d.font = '20px Georgia';
            // let text = newDirection.toFixed(2);
            // d.fillText(text, this.x+10, this.y+10);
            // text = delta1.toFixed(2) + ' ' + delta2.toFixed(2);
            // d.fillText(text, this.x+10, this.y+35);

        }
    };

    // Laser class
    // x1, y1 - enpoint 1
    // x2, y2 - endpoint 2
    // t- TK
    const L = function (x1, y1, x2, y2, t) { this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.t = 0; this.tm = t; this.s = 1; };
    L.prototype = {
        update: function (c) {
            let sp = this.t <= state.player.r ? 0.1 : 1;
            this.t += 4 * this.s * sp;
            if (this.t >= this.tm) this.s = -1;
            if (this.t < 0) c();
        },
        draw: function () {
            d.lineCap = "round";
            d.lineWidth = this.t;
            d.strokeStyle = this.t <= state.player.r ? "yellow" : "lime";
            d.beginPath();
            d.moveTo(this.x1, this.y1);
            d.lineTo(this.x2, this.y2);
            d.stroke();
            d.closePath();
        }
    };

    // Rotating laser class
    const rL = function (x, y, l, cw, t, s) { this.x = x; this.y = y; this.l = l; this.t = 0; this.tm = t; this.ef = (f + 900) % 900; this.cw = cw; this.s = s };
    rL.prototype = {
        rotate: function (ca) {
            let s = this.t <= state.player.r ? 0.05 : 1;
            if (this.t < this.tm) this.t += 2 * s;
            if (f == 0) ca();
            this.l.forEach(b => {
                let loc = b.y + (b.x == c.width && b.y < c.height ? c.height : 0) + b.x + (b.x > 0 && b.y == 0 ? c.width : 0);
                loc = (loc + this.s * this.cw) % (2 * (c.width + c.height));
                if (loc > 2 * c.height + c.width) {
                    b.x = loc - 2 * c.height + c.width;
                }
                else if (loc > c.height + c.width) {
                    b.y = loc - c.height + c.width;
                }
                else if (loc > c.height) {
                    b.x = loc - c.height;
                }
                else if (loc < c.height) {
                    b.y = loc;
                }
            })
        },
        draw: function () {
            d.strokeStyle = this.t <= state.player.r ? "yellow" : "lime";
            d.lineWidth = this.t;
            d.beginPath();
            this.l.forEach(c => {
                d.moveTo(this.x, this.y);
                d.lineTo(c.x, c.y);
            });
            d.stroke();
            d.closePath()
        }
    };

    // Initialize all the game elements.
    state.player = new Player(c.width / 2, c.height / 2);
    const bub = [],
        mis = [],
        las = [],
        rLas = [];
     state.player.draw();

    let st = setInterval(() => {
        if (state.gameOver) {
            // Display the game over screen
            d.fillStyle = "black";
            d.fillRect(0, 0, c.width, c.height);
            d.font = "50px times-new-roman";
            d.fillStyle = "lime";
            d.textAlign = "center";
            d.fillText("GAME OVER", c.width / 2, c.height / 2 - 25);
            d.fillText("SCORE: " + state.score, c.width / 2, c.height / 2 + 25);
            let rel = D.createElement("button");
            rel.innerHTML = "PLAY AGAIN >:)";
            rel.onclick = () => { location.reload() };
            D.body.childNodes[1].appendChild(D.createElement("br"));
            D.body.childNodes[1].appendChild(rel);
            clearInterval(st);
        } else if (!state.paused) {
            // Main event loop
            d.fillStyle = "rgba(0,0,0,0.25)";
            d.fillRect(0, 0, c.width, c.height);

            // Update the timer and generate attackers if needed.
            state.time += timeDelta / 1000.;
            addEnemies();

            // Bomb collision detection
            bub.forEach((b, i) => {
                b.update(() => { bub.splice(i, 1) });
                b.draw();
                if (b.active()) {
                    if (M.dis(state.player.x, state.player.y, b.x, b.y) < state.player.r + b.r && b.r > state.player.r) {
                        state.player.ifHit();
                        bub.splice(i, 1);
                        bub.length = 0;
                        mis.length = 0;
                    }
                }
            });

            // Missile collision detection
            mis.forEach((m, i) => {
                m.draw();
                m.move(() => {
                    state.objects[state.objects.length] = new Effect(m.x, m.y, m.r + 15, 2.5, "lime");
                    mis.splice(i, 1)
                });
                if (M.dis(state.player.x, state.player.y, m.x, m.y) < state.player.r + m.r) {
                    state.player.ifHit();
                    mis.splice(i, 1);
                    bub.length = 0;
                    mis.length = 0;
                }
            });

            // Laser collision detection
            las.forEach((l, i) => {
                l.draw();
                l.update(() => { las.splice(i, 1) });
                let m1 = (l.y2 - l.y1) / (l.x2 - l.x1);
                let m2 = -1 * (1 / m1);
                let b1 = l.y1 - m1 * l.x1;
                let b2 = state.player.y - m2 * state.player.x;
                let x = (b2 - b1) / (m1 - m2);
                let y = m1 * x + b1;
                if (M.dis(x, y, state.player.x, state.player.y) < state.player.r + l.t && l.t > state.player.r) {
                    state.player.ifHit();
                }
            });

            // Rotating laser collistion detection
            rLas.forEach((rl, i) => {
                rl.draw();
                rl.rotate(() => { rLas.splice(i, 1) });
                // rl.l.forEach(l => {
                //     //collision
                // })
            });


            // Update all the objects
            state.objects.forEach((e, i) => {
              // Update the object and remove if not alive.
              if (!e.update()) {
                state.objects.splice(i, 1);
              }
                e.draw(d);
            });

            // Do the boundar detection
            if (state.player.x <= state.player.r) { state.player.x = state.player.r }
            else if (state.player.x >= c.width - state.player.r) { state.player.x = c.width - state.player.r };
            if (state.player.y <= state.player.r) { state.player.y = state.player.r }
            else if (state.player.y >= c.height - state.player.r) { state.player.y = c.height - state.player.r };

            // Update the player
            state.player.move(state.keys);
            state.player.draw();

            // Check for health, and update the status bar
            if (state.lives <= 0) state.gameOver = true;
            let str = " ";
            for (let i = 0; i < state.lives; i++) {
                str += "💚 ";
            }
            bo.innerHTML = str + "-Poison Pool- " + state.score + ' ' + state.time.toFixed(2);
        } else {
            // Game is paused, display pause icon
            d.fillStyle = "red";
            d.fillRect(10, 10, 15, 33);
            d.fillRect(33, 10, 15, 33);
        }
    }, timeDelta);
})(document)
