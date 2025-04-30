const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const width = canvas.width;
const height = canvas.height;

let score = 0;
let highScore = 0;
let gameOver = false;

const GRAVITY = 0.3;
const JUMP_FORCE = -8;

const player = {
    x: width / 2 - 20,
    y: height - 60,
    width: 40,
    height: 40,
    vy: 0,
    color: "green",
    update() {
        this.vy += GRAVITY;
        this.y += this.vy;
        if (this.y > height) gameOver = true;
    },
    jump(force = JUMP_FORCE) {
        this.vy = force;
    },
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
};

const platformCount = 10;
const platforms = [];

function createPlatform(y, moving = false) {
    return {
        x: Math.random() * (width - 60),
        y: y,
        width: 60,
        height: 10,
        dx: moving ? (Math.random() < 0.5 ? -1 : 1) * 1 : 0,
        moving,
        draw() {
            ctx.fillStyle = this.moving ? "#b5651d" : "#654321";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            if (this.moving) {
                this.x += this.dx;
                if (this.x <= 0 || this.x + this.width >= width) this.dx *= -1;
            }
        },
    };
}

const powerUps = [];

function createPowerUp(x, y) {
    return {
        x: x,
        y: y,
        width: 20,
        height: 20,
        active: true,
        draw() {
            ctx.fillStyle = "gold";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            if (
                player.x < this.x + this.width &&
                player.x + player.width > this.x &&
                player.y < this.y + this.height &&
                player.y + player.height > this.y &&
                this.active
            ) {
                player.jump(JUMP_FORCE * 1.5);
                this.active = false;
            }
        },
    };
}

function resetGame() {
    player.x = width / 2 - 20;
    player.y = height - 60;
    player.vy = 0;
    score = 0;
    gameOver = false;
    platforms.length = 0;
    powerUps.length = 0;

    for (let i = 0; i < platformCount; i++) {
        platforms.push(createPlatform(height - i * 60, Math.random() < 0.3));
        if (Math.random() < 0.2) {
            powerUps.push(
                createPowerUp(Math.random() * (width - 20), height - i * 60 - 20)
            );
        }
    }
}

function update() {
    if (gameOver) return;

    player.update();

    if (player.y < height / 2) {
        const dy = height / 2 - player.y;
        player.y = height / 2;
        platforms.forEach((p) => (p.y += dy));
        powerUps.forEach((p) => (p.y += dy));
        score += Math.floor(dy);
    }

    platforms.forEach((p) => {
        p.update();
        if (
            player.x < p.x + p.width &&
            player.x + player.width > p.x &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + p.height &&
            player.vy > 0
        ) {
            player.jump();
        }

        if (p.y > height) {
            const i = platforms.indexOf(p);
            platforms.splice(i, 1);
            const newPlat = createPlatform(-10, Math.random() < 0.3);
            platforms.push(newPlat);
            if (Math.random() < 0.2) {
                powerUps.push(createPowerUp(Math.random() * (width - 20), -30));
            }
        }
    });

    powerUps.forEach((p) => p.update());
    powerUps
        .filter((p) => p.y > height || !p.active)
        .forEach((p) => {
            const i = powerUps.indexOf(p);
            if (i !== -1) powerUps.splice(i, 1);
        });
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    player.draw();
    platforms.forEach((p) => p.draw());
    powerUps.forEach((p) => p.draw());

    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#fff";
        ctx.font = "28px Arial";
        ctx.fillText("Game Over", width / 2 - 80, height / 2 - 20);
        ctx.font = "18px Arial";
        ctx.fillText("Click to Restart", width / 2 - 80, height / 2 + 10);
        if (score > highScore) highScore = score;
        ctx.fillText(`High Score: ${highScore}`, width / 2 - 80, height / 2 + 40);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.x -= 20;
    else if (e.key === "ArrowRight") player.x += 20;
});

canvas.addEventListener("click", () => {
    if (gameOver) resetGame();
});

resetGame();
loop();
