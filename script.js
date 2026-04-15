let score = 0, kills = 0, isGameOver = false;
let playerX = window.innerWidth / 2 - 30;
let keys = {}, touchL = false, touchR = false;

const player = document.getElementById("player");
const sndMusic = document.getElementById("sndMusic");

function startGame() {
    document.getElementById("start-menu").style.display = "none";
    sndMusic.play().catch(() => {}); // Play music
    
    // Skor otomatis +10 tiap detik
    setInterval(() => { if(!isGameOver) { score += 10; updateUI(); } }, 1000);

    gameLoop();
    spawnEnemy();
}

// Kontrol
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

const bL = document.getElementById("btn-left"), bR = document.getElementById("btn-right"), bJ = document.getElementById("btn-jump");
bL.ontouchstart = () => touchL = true; bL.ontouchend = () => touchL = false;
bR.ontouchstart = () => touchR = true; bR.ontouchend = () => touchR = false;
bJ.ontouchstart = jump;

function gameLoop() {
    if (isGameOver) return;
    let walk = false;
    if (keys["ArrowLeft"] || touchL) { playerX -= 5; walk = true; }
    if (keys["ArrowRight"] || touchR) { playerX += 5; walk = true; }
    if (keys["Space"] || keys["ArrowUp"]) jump();

    if (playerX < 0) playerX = 0;
    if (playerX > window.innerWidth - 60) playerX = window.innerWidth - 60;
    player.style.left = playerX + "px";
    
    if (walk) player.classList.add("walking"); else player.classList.remove("walking");
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
    
    let side = Math.random() > 0.5 ? -100 : window.innerWidth + 50;
    enemy.style.left = side + "px";
    document.getElementById("enemy-container").appendChild(enemy);

    let speed = lvl === 1 ? 2.5 : (lvl === 2 ? 3.5 : 1.5);
    let dir = side < 0 ? 1 : -1;
    let hasShot = false; // Biar bos cuma nembak 1x

    let moveInt = setInterval(() => {
        if (isGameOver) { clearInterval(moveInt); return; }
        let eX = parseInt(enemy.style.left);
        enemy.style.left = (eX + (speed * dir)) + "px";

        // Bos Level 3 Nembak Sekali saja pas di tengah
        if (lvl === 3 && !hasShot && Math.abs(eX - window.innerWidth/2) < 100) {
            createBullet(eX, dir);
            hasShot = true;
        }

        // Cek Tabrakan
        let p = player.getBoundingClientRect(), e = enemy.getBoundingClientRect();
        if (p.left < e.right && p.right > e.left && p.top < e.bottom && p.bottom > e.top) {
            if (p.bottom < e.top + 30) {
                // INJAK MATI
                let pts = lvl === 1 ? 50 : (lvl === 2 ? 100 : 200);
                score += pts; kills++;
                document.getElementById(`sndLvl${lvl}`).play();
                updateUI();
                enemy.style.transform = "scaleY(0.1)";
                clearInterval(moveInt);
                setTimeout(() => enemy.remove(), 200);
            } else { endGame(); }
        }
        if (eX < -300 || eX > window.innerWidth + 300) { enemy.remove(); clearInterval(moveInt); }
    }, 20);
    setTimeout(spawnEnemy, 3000 - (kills * 20)); // Spawn pelan2
}

function createBullet(x, dir) {
    const b = document.createElement("div");
    b.className = "bullet";
    b.style.left = x + "px"; b.style.bottom = "130px";
    document.getElementById("game-container").appendChild(b);
    document.getElementById("sndTembak").play();

    let bMove = setInterval(() => {
        let bX = parseInt(b.style.left);
        b.style.left = (bX + (3 * dir)) + "px"; // Peluru sangat pelan
        let p = player.getBoundingClientRect(), br = b.getBoundingClientRect();
        if (br.left < p.right && br.right > p.left && br.top < p.bottom && br.bottom > p.top) endGame();
        if (bX < -100 || bX > window.innerWidth + 100) { b.remove(); clearInterval(bMove); }
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
    document.getElementById("sndKalah").play();
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("final-score").innerText = score;
}
