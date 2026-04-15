let score = 0, kills = 0, isGameOver = false;
let playerX = window.innerWidth / 2 - 30;
let keys = {};
let touchLeft = false, touchRight = false;

const player = document.getElementById("player");
const sndMusic = document.getElementById("sndMusic");
const sndKalah = document.getElementById("sndKalah");

// Jalankan Musik saat buka web (interaksi pertama)
window.addEventListener('click', () => { if(!isGameOver && sndMusic.paused) { /* Autoplay diatur di StartGame */ } }, {once: true});

function startGame() {
    document.getElementById("start-menu").style.display = "none";
    sndMusic.play();
    
    // Poin nambah tiap detik (+10)
    setInterval(() => {
        if (!isGameOver) { score += 10; updateUI(); }
    }, 1000);

    gameLoop();
    spawnEnemy();
}

// Kontrol Keyboard
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// Kontrol HP
const bLeft = document.getElementById("btn-left");
const bRight = document.getElementById("btn-right");
const bJump = document.getElementById("btn-jump");

bLeft.ontouchstart = () => touchLeft = true; bLeft.ontouchend = () => touchLeft = false;
bRight.ontouchstart = () => touchRight = true; bRight.ontouchend = () => touchRight = false;
bJump.ontouchstart = jump;

function gameLoop() {
    if (isGameOver) return;

    let move = false;
    if (keys["ArrowLeft"] || touchLeft) { playerX -= 6; move = true; }
    if (keys["ArrowRight"] || touchRight) { playerX += 6; move = true; }
    if (keys["Space"] || keys["ArrowUp"]) jump();

    // Batas Layar
    if (playerX < 0) playerX = 0;
    if (playerX > window.innerWidth - 60) playerX = window.innerWidth - 60;

    player.style.left = playerX + "px";
    if (move) player.classList.add("walking"); else player.classList.remove("walking");

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!player.classList.contains("jumping") && !isGameOver) {
        player.classList.add("jumping");
        document.getElementById("sndJump").play();
        setTimeout(() => player.classList.remove("jumping"), 600);
    }
}

function spawnEnemy() {
    if (isGameOver) return;
    const enemy = document.createElement("div");
    const lvl = Math.floor(Math.random() * 3) + 1;
    enemy.className = `enemy lvl${lvl}`;
    
    let side = Math.random() > 0.5 ? -100 : window.innerWidth + 20;
    enemy.style.left = side + "px";
    document.getElementById("enemy-container").appendChild(enemy);

    let speed = lvl === 1 ? 3 : (lvl === 2 ? 4.5 : 2); // Bos pelan
    let dir = side < 0 ? 1 : -1;

    let moveInterval = setInterval(() => {
        if (isGameOver) { clearInterval(moveInterval); return; }
        let eX = parseInt(enemy.style.left);
        enemy.style.left = (eX + (speed * dir)) + "px";

        // Bos Level 3 Nembak Putih
        if (lvl === 3 && Math.random() < 0.015) createBullet(eX, dir);

        // Deteksi Tabrakan
        let p = player.getBoundingClientRect(), e = enemy.getBoundingClientRect();
        if (p.left < e.right && p.right > e.left && p.top < e.bottom && p.bottom > e.top) {
            if (p.bottom < e.top + 35) {
                // Injak Kepala
                let bonus = lvl === 1 ? 50 : (lvl === 2 ? 100 : 200);
                score += bonus; kills++;
                document.getElementById(`sndLvl${lvl}`).play();
                updateUI();
                enemy.style.transform = "scaleY(0.1)";
                clearInterval(moveInterval);
                setTimeout(() => enemy.remove(), 200);
            } else { endGame(); }
        }

        if (eX < -200 || eX > window.innerWidth + 200) { enemy.remove(); clearInterval(moveInterval); }
    }, 20);

    setTimeout(spawnEnemy, Math.max(700, 2600 - (kills * 50)));
}

function createBullet(x, dir) {
    const b = document.createElement("div");
    b.className = "bullet";
    b.style.left = x + "px"; b.style.bottom = "110px";
    document.getElementById("game-container").appendChild(b);
    document.getElementById("sndTembak").play();

    let bMove = setInterval(() => {
        let bX = parseInt(b.style.left);
        b.style.left = (bX + (4 * dir)) + "px"; // Peluru pelan
        let p = player.getBoundingClientRect(), br = b.getBoundingClientRect();
        if (br.left < p.right && br.right > p.left && br.top < p.bottom && br.bottom > p.top) endGame();
        if (bX < -50 || bX > window.innerWidth + 50) { b.remove(); clearInterval(bMove); }
    }, 20);
}

function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("kills").innerText = kills;
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    sndMusic.pause();
    sndKalah.play();
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("final-score").innerText = score;
}
