const player = document.getElementById("player");
const enemyContainer = document.getElementById("enemy-container");
const scoreDisp = document.getElementById("score");

// Audio
const jumpSound = document.getElementById("audioJump");
const sound1 = document.getElementById("audioLevel1");
const sound2 = document.getElementById("audioLevel2");
const sound3 = document.getElementById("audioLevel3");
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
        jumpSound.currentTime = 0;
        jumpSound.play();
        setTimeout(() => player.classList.remove("jumping"), 600);
    }
}

document.addEventListener("keydown", (e) => { if(e.code === "Space") jump(); });
document.addEventListener("touchstart", (e) => { e.preventDefault(); jump(); });

// SPAWN MUSUH
function spawnEnemy() {
    if (isGameOver) return;

    const enemy = document.createElement("div");
    const lvl = Math.floor(Math.random() * 3) + 1;
    enemy.classList.add("enemy", "lvl" + lvl);
    
    let side = Math.random() > 0.5 ? -60 : 660;
    enemy.style.left = side + "px";
    enemyContainer.appendChild(enemy);

    let speed = lvl === 1 ? 2.5 : (lvl === 2 ? 2 : 3);
    let dir = side < 0 ? 1 : -1;

    let moveInterval = setInterval(() => {
        if (isGameOver) { clearInterval(moveInterval); return; }

        let currentLeft = parseInt(enemy.style.left);
        enemy.style.left = (currentLeft + (speed * dir)) + "px";

        // Level 3 Menembak
        if (lvl === 3 && Math.random() < 0.015) shoot(currentLeft, dir);

        // CEK TABRAKAN
        let pRect = player.getBoundingClientRect();
        let eRect = enemy.getBoundingClientRect();

        if (pRect.left < eRect.right && pRect.right > eRect.left && pRect.top < eRect.bottom && pRect.bottom > eRect.top) {
            // Logika Injak Kepala (Toleransi 40px tinggi foto)
            if (pRect.bottom < eRect.top + 40) {
                enemy.classList.add("die-anim");
                
                // Suara per level
                if (lvl === 1) { sound1.currentTime = 0; sound1.play(); }
                if (lvl === 2) { sound2.currentTime = 0; sound2.play(); }
                if (lvl === 3) { sound3.currentTime = 0; sound3.play(); }

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

    setTimeout(spawnEnemy, Math.max(600, 2200 - (score * 60)));
}

function shoot(x, dir) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = x + "px";
    bullet.style.bottom = "25px";
    document.getElementById("game-container").appendChild(bullet);
    shootSound.currentTime = 0;
    shootSound.play();

    let bMove = setInterval(() => {
        let bLeft = parseInt(bullet.style.left);
        bullet.style.left = (bLeft + (7 * dir)) + "px";

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
