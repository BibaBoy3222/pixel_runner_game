
let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

document.getElementById("submitName").onclick = () => {
  const input = document.getElementById("playerName");
  if (input.value.trim() === "") return;
  playerName = input.value.trim();
  document.getElementById("nameInput").style.display = "none";
  update(); // запустить игру
};

function endGame() {
  leaderboard.push({ name: playerName, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  drawLeaderboard();
}

function drawLeaderboard() {
  let lb = leaderboard.map((e, i) => `${i + 1}. ${e.name}: ${e.score}`).join("\n");
  document.getElementById("leaderboard").innerText = lb;
}



const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let backgroundImg = new Image();
backgroundImg.src = "images/background.png";
let bgY = 0;

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
document.addEventListener("keydown", (e) => { if (e.code === "Space") shoot(); });
document.getElementById("left").addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowLeft"] = true; });
document.getElementById("left").addEventListener("touchend", (e) => { e.preventDefault(); keys["ArrowLeft"] = false; });
document.getElementById("right").addEventListener("touchstart", (e) => { e.preventDefault(); keys["ArrowRight"] = true; });
document.getElementById("right").addEventListener("touchend", (e) => { e.preventDefault(); keys["ArrowRight"] = false; });
canvas.addEventListener("click", (e) => { e.preventDefault(); shoot(); });

let shootCooldown = 0;
function update() {
  if (keys["ArrowLeft"] && ship.x > 0) ship.x -= ship.speed;
  if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;

  shootCooldown--;
  if ((keys["ArrowLeft"] || keys["ArrowRight"]) && shootCooldown <= 0) {
    shoot();
    shootCooldown = 15;
  }
  if (keys["ArrowRight"] && ship.x < canvas.width - ship.width) ship.x += ship.speed;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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
