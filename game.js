
let backgroundImg = new Image();
backgroundImg.src = "images/background.png";
let bgY = 0;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let shipImg = new Image();
shipImg.src = "images/ship.png";

let bulletImg = new Image();
bulletImg.src = "images/bullet.png";

let asteroidImg = new Image();
asteroidImg.src = "images/asteroid.png";

let ship = { x: canvas.width/2 - 20, y: canvas.height - 60, width: 40, height: 40, speed: 5 };
let bullets = [];
let asteroids = [];
let score = 0;

function drawShip() {
    ctx.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
}

function drawBullets() {
    bullets.forEach(b => {
        ctx.drawImage(bulletImg, b.x, b.y, 10, 20);
        b.y -= b.speed;
    });
    bullets = bullets.filter(b => b.y > -20);
}

function drawAsteroids() {
    asteroids.forEach(a => {
        ctx.drawImage(asteroidImg, a.x, a.y, 40, 40);
        a.y += a.speed;
    });
    asteroids = asteroids.filter(a => a.y < canvas.height + 40);
}

function detectCollisions() {
    bullets.forEach((b, bi) => {
        asteroids.forEach((a, ai) => {
            if (b.x < a.x + 40 && b.x + 10 > a.x && b.y < a.y + 40 && b.y + 20 > a.y) {
                asteroids.splice(ai, 1);
                bullets.splice(bi, 1);
                score += 10;
                document.getElementById("score").innerText = "Score: " + score;
            }
        });
    });
}

function spawnAsteroid() {
    let x = Math.random() * (canvas.width - 40);
    asteroids.push({ x: x, y: -40, speed: 2 + Math.random() * 2 });
}

let keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

function shoot() {
    bullets.push({ x: ship.x + ship.width/2 - 5, y: ship.y, speed: 7 });
}

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") shoot();
});

function update() {
    if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
    if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;

    
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Фон
bgY += 1;
if (bgY >= canvas.height) bgY = 0;
ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);

    drawShip();
    drawBullets();
    drawAsteroids();
    detectCollisions();

    requestAnimationFrame(update);
}

setInterval(spawnAsteroid, 1000);
update();


// Уровни и боссы
let level = 1;
let boss = null;

function spawnBoss() {
  boss = { x: canvas.width / 2 - 50, y: 50, width: 100, height: 100, hp: 100, speed: 1 };
}

function drawBoss() {
  if (!boss) return;
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  boss.x += boss.speed;
  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.speed *= -1;

  bullets.forEach((b, bi) => {
    if (b.x < boss.x + boss.width && b.x + 10 > boss.x && b.y < boss.y + boss.height && b.y + 20 > boss.y) {
      bullets.splice(bi, 1);
      boss.hp -= 5;
      if (boss.hp <= 0) {
        score += 100;
        boss = null;
        level += 1;
        document.getElementById("score").innerText = "Score: " + score;
      }
    }
  });
}

// Усложнение игры
setInterval(() => {
  if (score > 0 && score % 100 === 0 && !boss) {
    spawnBoss();
  }
}, 1000);

// Отображение уровня
setInterval(() => {
  document.getElementById("score").innerText = "Score: " + score + " | Level: " + level;
}, 500);

// Включаем отрисовку босса
function updateGameWithBoss() {
  if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
  if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;

  
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Фон
bgY += 1;
if (bgY >= canvas.height) bgY = 0;
ctx.drawImage(backgroundImg, 0, bgY - canvas.height, canvas.width, canvas.height);
ctx.drawImage(backgroundImg, 0, bgY, canvas.width, canvas.height);

  drawShip();
  drawBullets();
  drawAsteroids();
  detectCollisions();
  drawBoss();

  requestAnimationFrame(updateGameWithBoss);
}

updateGameWithBoss();
