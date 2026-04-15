let score = 0, kills = 0, isGameOver = false;
let playerX = window.innerWidth / 2 - 30;
let keys = {}, touchL = false, touchR = false;

// Referensi Elemen
const player = document.getElementById("player");
const sndMenu = document.getElementById("sndMenu");
const sndMusic = document.getElementById("sndMusic");
const sndKalah = document.getElementById("sndKalah");
const sndJump = document.getElementById("sndJump");
const sndTembak = document.getElementById("sndTembak");

// 1. Logika Musik Menu (Jalan saat pertama kali layar diklik)
window.addEventListener('click', () => {
    if (document.getElementById("start-menu").style.display !== "none") {
        sndMenu.play().catch(() => {});
    }
}, { once: true });

// 2. Fungsi Mulai Game
function startGame() {
    document.getElementById("start-menu").style.display = "none";
    
    // Transisi Musik
    sndMenu.pause();
    sndMenu.currentTime = 0;
    sndMusic.play().catch(() => {});
    
    // Poin otomatis +10 tiap detik
    setInterval(() => { 
        if(!isGameOver) { 
            score += 10; 
            updateUI(); 
        } 
    }, 1000);

    gameLoop();
    spawnEnemy();
}

// 3. Kontrol Pergerakan (Keyboard)
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

// 4. Kontrol Pergerakan (HP)
const bL = document.getElementById("btn-left");
const bR = document.getElementById("btn-right");
const bJ = document.getElementById("btn-jump");

if(bL) {
    bL.ontouchstart = (e) => { e.preventDefault(); touchL = true; };
    bL.ontouchend = () => touchL = false;
}
if(bR) {
    bR.ontouchstart = (e) => { e.preventDefault(); touchR = true; };
    bR.ontouchend = () => touchR = false;
}
if(bJ) {
    bJ.ontouchstart = (e) => { e.preventDefault(); jump(); };
}

function gameLoop() {
    if (isGameOver) return;
    let walk = false;

    if (keys["ArrowLeft"] || touchL) { playerX -= 6; walk = true; }
    if (keys["ArrowRight"] || touchRight || touchR) { playerX += 6; walk = true; }
    if (keys["Space"] || keys["ArrowUp"]) jump();

    // Batas Layar agar tidak tembus
    if (playerX < 0) playerX = 0;
    if (playerX > window.innerWidth - 60) playerX = window.innerWidth - 60;
    player.style.left = playerX + "px";
    
    // Efek Kaki Jalan
    if (walk) player.classList.add("walking"); else player.classList.remove("walking");
    
    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!player.classList.contains("jumping") && !isGameOver) {
        player.classList.add("jumping");
        sndJump.currentTime = 0;
        sndJump.play();
        setTimeout(() => player.classList.remove("jumping"), 600);
    }
}

// 5. Sistem Musuh (3 Tipe Foto)
function spawnEnemy() {
    if (isGameOver) return;
    const enemy = document.createElement("div");
    const lvl = Math.floor(Math.random() * 3) + 1;
    enemy.className = `enemy lvl${lvl}`;
    
    let side = Math.random() > 0.5 ? -100 : window.innerWidth + 50;
    enemy.style.left = side + "px";
    document.getElementById("enemy-container").appendChild(enemy);

    let speed = lvl === 1 ? 2.5 : (lvl === 2 ? 3.8 : 1.6); // Bos paling pelan
    let dir = side < 0 ? 1 : -1;
    let hasShot = false;

    let moveInt = setInterval(() => {
        if (isGameOver) { clearInterval(moveInt); return; }
        let eX = parseInt(enemy.style.left);
        enemy.style.left = (eX + (speed * dir)) + "px";

        // Bos Level 3 Nembak (Hanya sekali pas muncul biar ga spam)
        if (lvl === 3 && !hasShot && Math.abs(eX - window.innerWidth/2) < 150) {
            createBullet(eX, dir);
            hasShot = true;
        }

        // Cek Tabrakan dengan Player
        let p = player.getBoundingClientRect(), e = enemy.getBoundingClientRect();
        if (p.left < e.right && p.right > e.left && p.top < e.bottom && p.bottom > e.top) {
            // Logika Injak Kepala
            if (p.bottom < e.top + 35) {
                let pts = lvl === 1 ? 50 : (lvl === 2 ? 100 : 200);
                score += pts; kills++;
                
                // Suara mati sesuai level
                const soundEff = document.getElementById(`sndLvl${lvl}`);
                if(soundEff) { soundEff.currentTime = 0; soundEff.play(); }
                
                updateUI();
                enemy.style.transform = "scaleY(0.1)"; // Efek gepeng
                clearInterval(moveInt);
                setTimeout(() => enemy.remove(), 200);
            } else { 
                endGame(); 
            }
        }
        
        // Hapus musuh jika lewat layar
        if (eX < -300 || eX > window.innerWidth + 300) {
            enemy.remove();
            clearInterval(moveInt);
        }
    }, 20);

    // Kecepatan Spawn musuh (makin sulit seiring naiknya kill)
    setTimeout(spawnEnemy, Math.max(900, 2800 - (kills * 40)));
}

// 6. Sistem Tembakan Bos (Peluru Putih Pelan)
function createBullet(x, dir) {
    const b = document.createElement("div");
    b.className = "bullet";
    b.style.left = x + "px"; 
    b.style.bottom = "130px";
    document.getElementById("game-container").appendChild(b);
    sndTembak.currentTime = 0;
    sndTembak.play();

    let bMove = setInterval(() => {
        let bX = parseInt(b.style.left);
        b.style.left = (bX + (3.5 * dir)) + "px"; // Pelan banget biar bisa dihindari

        let p = player.getBoundingClientRect(), br = b.getBoundingClientRect();
        if (br.left < p.right && br.right > p.left && br.top < p.bottom && br.bottom > p.top) {
            endGame();
        }

        if (bX < -150 || bX > window.innerWidth + 150) {
            b.remove();
            clearInterval(bMove);
        }
    }, 20);
}

function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("kills").innerText = kills;
}

// 7. Fungsi Game Over
function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    
    sndMusic.pause();
    sndKalah.currentTime = 0;
    sndKalah.play();
    
    document.getElementById("game-over").style.display = "flex";
    document.getElementById("final-score").innerText = score;
}
