window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); // for 2d 
    canvas.width = 1200;
    canvas.height = 500;

    class InputHandler {
        constructor(game) {
            this.game = game;
            // when keys array is empty
            window.addEventListener('keydown', (e) => {
                if (((e.key === 'ArrowUp') || (e.key === 'ArrowDown')) && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key);
                }
                else if (e.key === ' ') {
                    this.game.player.shootTop();
                }
                else if (e.key === 'd') {
                    this.game.debug = !this.game.debug;
                }
                // console.log(this.game.keys);
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                // console.log(this.game.keys);
            });
        }
    }
    class Projectile {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 20;
            this.height = 10;
            this.speed = 3;
            this.markedForDeletion = false;
            this.image = document.getElementById('projectile');
        }
        update() {
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            // context.fillStyle = 'yellow';
            // context.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1; //velocity of angle
            this.bounced = false;
            this.bottomboundboundary = Math.random() * 100 + 60;

        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size) {
                this.markedForDeletion = true;
            }
            if (this.y > this.game.height - this.bottomboundboundary && !this.bounced) {
                this.bounced = true;
                this.speedY *= -0.5;
            }
        }
        draw(context) {
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize,
                this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }

    }
    class Player {
        constructor(game) {
            this.game = game;
            // player width and height
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 3; // 2px perframe
            this.projectiles = []; // store emulates
            this.image = document.getElementById('player');
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
            this.powerUp = false;
        }
        update(deltaTime) {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // vertical boundaries
            if (this.y > this.game.height - this.height * 0.5) {
                this.y = this.game.height - this.height * 0.5;
            }
            else if (this.y < - this.height * 0.5) {
                this.y < - this.height * 0.5
            }


            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion)
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            }
            else
                this.frameX = 0;

            // power up
            if (this.powerUp)
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                }
                else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
        }

        draw(context) {
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            // context.fillStyle = 'black';
            if (this.game.debug) { context.strokeRect(this.x, this.y, this.width, this.height); }
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
        }

        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 10));
                // console.log(this.projectiles);
                this.game.ammo--;
            }

            if (this.powerUp) {
                this.shootBottom();
            }
        }
        shootBottom() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
                this.game.ammo--;
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            console.log(this.powerUp);
            this.game.ammo = this.game.maxammo;
        }

    }
    class Enemy {

        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5; // speed
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update() {
            this.x += this.speedX - this.game.speed;
            if (this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            }
            else
                this.frameX = 0;
        }

        draw(context) {// context.fillStyle = 'red';// context.fillStyle = 'black';
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
            if (this.game.debug) {
                context.font = '20px Helvetica';
                context.fillText(this.lives, this.x, this.y);
            }
        }
    }

    class Anglar1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // height
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 3;
            this.score = this.lives;
        }
    }
    class Anglar2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // height
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 2;
            this.score = this.lives;
        }
    }


    class LuckyFish extends Enemy {
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // height
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 15;
            this.score = this.lives;
            this.type = 'lucky';
        }
    }
    class Hivewhale extends Enemy {
        constructor(game) {
            super(game);
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.9 - this.height); // height
            this.image = document.getElementById('hivewhale');
            this.speedX = (Math.random() * -1.2 - 0.2);
            this.frameY = 0;
            this.lives = 15;
            this.score = this.lives;
            this.type = 'hive';

        }
    }
    class Drone extends Enemy {
        constructor(game, x, y) {
            super(game);
            this.width = 115;
            this.height = 95;
            this.x = x; // height
            this.y = y; // height
            this.image = document.getElementById('drone');
            this.speedX = (Math.random() * -4.2 - 0.5);
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone';

        }
    }
    class Layer {
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1769;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update() {
            if (this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background {
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update() {
            this.layers.forEach(layer => layer.update());
            // console.log(this.layers);
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
            // console.log("hello111");
        }
    }
    // class Explotion {
    //     constructor(game, x, y) {
    //         this.game = game;
    //         this.x = x;
    //         this.y = y;
    //         this.frameX = 0;
    //         this.spriteHeight = 200;
    //         this.fps = 15;
    //         this.timer = 0;
    //         this.interval = 1000 / this.fps;
    //         this.markedForDeletion = false;
    //     }
    //     update(deltaTime) {
    //         this.frameX++;
    //     }
    //     draw(context) {
    //         context.drawImage(this.image, this.x, this.y);
    //     }
    // }
    // class SmokeExplosion extends Explotion {

    // }
    // class FireExplosion extends Explotion {

    // }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Bangers";
            this.color = 'white';

        }

        draw(context) {
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 1.5;
            context.shadowOffsetY = 1.5;
            context.font = this.fontSize + 'px ' + this.fontFamily;
            //score
            context.fillText('Score: ' + this.game.score, 20, 40);
            // ammo
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            // time
            let formattedTime = (this.game.gameTime * .001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 20, 100);

            // game over message
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1;
                let message2;
                if (this.game.score > this.game.gameOver) {
                    message1 = "You Win";
                    message2 = "Well done";
                }
                else {
                    message1 = "You Lose";
                    message2 = "Try Again";
                }
                context.font = "50px " + this.fontfamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = "25px " + this.fontfamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
                context.restore();
            }

            // powerUp ammo
            if (this.game.player.powerUp) context.fillStyle = 'white';
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
            context.fillStyle = 'yellow';


        }

    }

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this); // this keyword point to game object
            this.input = new InputHandler(this);
            this.background = new Background(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemytimer = 0;
            this.enemyInterval = 1000;
            this.particles = [];
            // this.lives = 0;
            this.ammo = 20;
            this.maxammo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.winningScore = 10;
            this.score = 0;
            this.gameTime = 0;
            this.TimeLimit = 15000;
            this.speed = 1;
            this.debug = true;

        }

        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime;
            if (this.gameTime > this.TimeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) {
                // console.log(this.ammoTimer);
                if (this.ammo < this.maxammo) this.ammo++;
                this.ammoTimer = 0;
            }
            else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion)
            this.enemies.forEach(enemy => {
                enemy.update();
                if (this.checkCollison(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    for (let i = 0; i < enemy.score; i++) {
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                    }
                    if (enemy.type === 'lucky') this.player.enterPowerUp();
                    else this.score--;
                }

                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollison(projectile, enemy)) {
                        enemy.lives--;
                        // console.log(enemy.lives);
                        projectile.markedForDeletion = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        if (enemy.lives <= 0) {
                            for (let i = 0; i < enemy.score; i++) {
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                            }
                            enemy.markedForDeletion = true;
                            this.score += enemy.score;
                            // console.log(enemy.score);
                            if (enemy.type === 'hive') {
                                for (let i = 0; i < 5; i++)
                                    this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height));
                            }
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                });

            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemytimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemytimer = 0;
            }
            else {
                this.enemytimer += deltaTime;
            }

        }
        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.background.layer4.draw(context);
            this.particles.forEach(particle => particle.draw(context));
        }
        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Anglar1(this));
            else if (randomize < 0.6) this.enemies.push(new Anglar2(this));
            else if (randomize < 0.8) this.enemies.push(new Hivewhale(this));
            else this.enemies.push(new LuckyFish(this));
        }
        checkCollison(rect1, rect2) {
            return (
                (rect1.x < rect2.x + rect2.width) &&
                (rect1.x + rect1.width > rect2.x) &&
                (rect1.y < rect2.y + rect2.height) &&
                (rect1.y + rect1.height > rect2.y)
            )
        }
    }
    // game object
    const game = new Game(canvas.width, canvas.height);
    let lasttime = 0;

    // animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lasttime;
        lasttime = timeStamp;
        // console.log(lasttime);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});
