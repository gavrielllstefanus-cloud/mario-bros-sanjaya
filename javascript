const player = document.getElementById("player");
const container = document.getElementById("game-container");
const enemyContainer = document.getElementById("enemy-container");
const scoreDisp = document.getElementById("score");
const jumpSound = document.getElementById("audioJump");
const deadSound = document.getElementById("audioDead");
const shootSound = document.getElementById("audioShoot");

let score = 0;
let isGameOver = false;

function startGame() {
    document.getElementById("start-menu").style.display = "none";
    spawnEnemy();
}

// LOMPAT
function jump() {
    if (!player.classList.contains("jumping") && !isGameOver) {
        player.classList.add("jumping");
        jumpSound.play();
        setTimeout(() => player.classList.remove("jumping"), 600);
    }
}
document.addEventListener("keydown", (e) => { if(e.code === "Space") jump(); });
document.addEventListener("touchstart", jump);

// MUNCULIN MUSUH
function spawnEnemy() {
    if (isGameOver) return;

    const enemy = document.createElement("div");
    const lvl = Math.floor(Math.random() * 3) + 1; // Level 1, 2, atau 3
    enemy.classList.add("enemy", "lvl" + lvl);
    
    let side = Math.random() > 0.5 ? -50 : 650;
    enemy.style.left = side + "px";
    enemyContainer.appendChild(enemy);

    let speed = lvl === 1 ? 2 : (lvl === 2 ? 1.5 : 2.5);
    let dir = side < 0 ? 1 : -1;

    let moveInterval = setInterval(() => {
        if (isGameOver) { clearInterval(moveInterval); return; }

        let currentLeft = parseInt(enemy.style.left);
        enemy.style.left = (currentLeft + (speed * dir)) + "px";

        // Level 3 bisa nembak
        if (lvl === 3 && Math.random() < 0.01) {
            shoot(currentLeft, dir);
        }

        // Cek Tabrakan
        let pRect = player.getBoundingClientRect();
        let eRect = enemy.getBoundingClientRect();

        if (pRect.left < eRect.right && pRect.right > eRect.left && pRect.top < eRect.bottom && pRect.bottom > eRect.top) {
            // Logika Menginjak (Kepala)
            if (pRect.bottom < eRect.top + 30) {
                enemy.classList.add("die-anim");
                deadSound.play();
                score++;
                scoreDisp.innerText = "Kills: " + score;
                clearInterval(moveInterval);
                setTimeout(() => enemy.remove(), 500);
            } else {
                endGame();
            }
        }

        if (currentLeft < -100 || currentLeft > 700) {
            enemy.remove();
            clearInterval(moveInterval);
        }
    }, 20);

    setTimeout(spawnEnemy, Math.max(800, 2000 - (score * 50)));
}

function shoot(x, dir) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = x + "px";
    bullet.style.bottom = "20px";
    container.appendChild(bullet);
    shootSound.play();

    let bMove = setInterval(() => {
        let bLeft = parseInt(bullet.style.left);
        bullet.style.left = (bLeft + (6 * dir)) + "px";

        let pRect = player.getBoundingClientRect();
        let bRect = bullet.getBoundingClientRect();

        if (bRect.left < pRect.right && bRect.right > pRect.left && bRect.top < pRect.bottom && bRect.bottom > pRect.top) {
            endGame();
        }

        if (bLeft < -50 || bLeft > 650) {
            bullet.remove();
            clearInterval(bMove);
        }
    }, 20);
}

function endGame() {
    isGameOver = true;
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("final-score").innerText = score;
}
