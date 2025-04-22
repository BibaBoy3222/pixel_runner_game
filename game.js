
let maxAsteroids = 5;
let asteroidCooldown = 0;
let gameRunning = true;

function spawnAsteroid() {
  if (asteroids.length < maxAsteroids && asteroidCooldown <= 0) {
    let x = Math.random() * (canvas.width - 40);
    asteroids.push({ x: x, y: -40, speed: 1 + Math.random() * 1.5 + level * 0.2 });
    asteroidCooldown = 30 + Math.random() * 30;
  }
}

function detectPlayerHit() {
  // asteroids
  for (let a of asteroids) {
    if (a.x < ship.x + ship.width && a.x + 40 > ship.x &&
        a.y < ship.y + ship.height && a.y + 40 > ship.y) {
      gameOver();
      return;
    }
  }
  // boss
  if (boss && boss.x < ship.x + ship.width && boss.x + boss.width > ship.x &&
      boss.y < ship.y + ship.height && boss.y + boss.height > ship.y) {
    gameOver();
  }
}

function gameOver() {
  gameRunning = false;
  ctx.fillStyle = "red";
  ctx.font = "36px monospace";
  ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
  endGame();
}



let coins = parseInt(localStorage.getItem("coins") || "0");
let upgradesStore = JSON.parse(localStorage.getItem("upgrades") || 
  '{"shootSpeed":0,"moveSpeed":0,"tripleShot":0}');
document.getElementById("coinsDisplay").innerText = "Coins: " + coins;

function updateUpgradeDisplay() {
  document.getElementById("shootLvl").innerText = upgradesStore.shootSpeed;
  document.getElementById("speedLvl").innerText = upgradesStore.moveSpeed;
  document.getElementById("tripleLvl").innerText = upgradesStore.tripleShot;
  document.getElementById("coinsDisplay").innerText = "Coins: " + coins;
}

function buyUpgrade(type) {
  const costs = { shootSpeed: 10, moveSpeed: 10, tripleShot: 25 };
  const cost = costs[type] + upgradesStore[type] * 10;
  if (coins >= cost) {
    coins -= cost;
    upgradesStore[type]++;
    localStorage.setItem("coins", coins);
    localStorage.setItem("upgrades", JSON.stringify(upgradesStore));
    updateUpgradeDisplay();
  } else {
    alert("Not enough coins!");
  }
}

document.getElementById("submitName").onclick = () => {
  const input = document.getElementById("playerName");
  if (input.value.trim() === "") return;
  playerName = input.value.trim();
  document.getElementById("nameInput").style.display = "none";
  document.getElementById("shop").style.display = "block";
  updateUpgradeDisplay();
};

setTimeout(() => {
  const playBtn = document.createElement("button");
  playBtn.innerText = "Play";
  playBtn.onclick = () => {
    document.getElementById("shop").style.display = "none";
    update();
  };
  document.getElementById("shop").appendChild(playBtn);
}, 500);

function endGame() {
  leaderboard.push({ name: playerName, score });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  coins += Math.floor(score / 10);
  localStorage.setItem("coins", coins);
  drawLeaderboard();
}



let level = 1;
let levelTime = 0;
let boss = null;
let upgrades = {
  tripleShot: false,
  speedBoost: false
};

function drawLevel() {
  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.fillText("Level: " + level, 10, 50);
  if (boss) {
    ctx.fillText("Boss HP: " + boss.hp, 10, 70);
  }
}

function spawnBoss() {
  boss = {
    x: canvas.width / 2 - 60,
    y: 0,
    width: 120,
    height: 60,
    hp: 20 + level * 10,
    speed: 1 + level * 0.2
  };
}

function drawBoss() {
  if (!boss) return;
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
  boss.y += boss.speed;
  if (boss.y > 100) boss.y = 100;
}

function detectBossHit() {
  if (!boss) return;
  bullets.forEach((b, bi) => {
    if (
      b.x < boss.x + boss.width &&
      b.x + 10 > boss.x &&
      b.y < boss.y + boss.height &&
      b.y + 20 > boss.y
    ) {
      bullets.splice(bi, 1);
      boss.hp -= 1;
      if (boss.hp <= 0) {
        score += 100;
        boss = null;
        level++;
        spawnUpgrade();
      }
    }
  });
}

function shoot() {
  bullets.push({ x: ship.x + ship.width/2 - 5, y: ship.y, speed: 7 });
  if (upgrades.tripleShot) {
    bullets.push({ x: ship.x + 5, y: ship.y, speed: 7 });
    bullets.push({ x: ship.x + ship.width - 15, y: ship.y, speed: 7 });
  }
}

function spawnUpgrade() {
  upgradesOnField.push({
    x: Math.random() * (canvas.width - 30),
    y: -30,
    type: Math.random() > 0.5 ? "tripleShot" : "speedBoost",
    speed: 2
  });
}

let upgradesOnField = [];
function drawUpgrades() {
  upgradesOnField.forEach((u, i) => {
    ctx.fillStyle = u.type === "tripleShot" ? "cyan" : "orange";
    ctx.fillRect(u.x, u.y, 30, 30);
    u.y += u.speed;

    if (
      u.x < ship.x + ship.width &&
      u.x + 30 > ship.x &&
      u.y < ship.y + ship.height &&
      u.y + 30 > ship.y
    ) {
      upgradesOnField.splice(i, 1);
      if (u.type === "tripleShot") {
        upgrades.tripleShot = true;
        setTimeout(() => upgrades.tripleShot = false, 10000);
      } else {
        ship.speed += 2;
        setTimeout(() => ship.speed -= 2, 10000);
      }
    }
  });
}


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

  
  levelTime++;
  if (levelTime > 1800 && !boss) {
    level++;
    levelTime = 0;
    if (level % 3 === 0) spawnBoss();
  }

  drawBoss();
  detectBossHit();
  drawLevel();
  drawUpgrades();

  
  detectPlayerHit();
  asteroidCooldown--;
  spawnAsteroid();
  requestAnimationFrame(() => { if (gameRunning) update(); });

}

setInterval(spawnAsteroid, 1000);
update();
