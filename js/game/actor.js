class Actor {
    frameCount = 0;

    stageFilter = false;

    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }

    checkCollision = (game, other) => CollisionBox.intersects(this, other);

    takeHit = (game, other) => {
        game.stage.particles.ray(this.checkCollision(game, other).pos);
        game.stage.particles.impact(this.checkCollision(game, other).pos);
        if (this.health) {
            this.health--;
            if (!this.health) game.stage.particles.impact_2(this.checkCollision(game, other).pos);
        }
    }

    update = game => this.frameCount++;

    draw = (game, cx) => {}

    displayCollisionBox = (game, cx) => {
        cx.save();
        cx.translate(Math.round(this.pos.x), Math.round(this.pos.y));
        cx.strokeStyle = "#00f8";
        cx.strokeRect(.5, .5, this.size.x - 1, this.size.y - 1);
        cx.fillStyle = "#00f4";
        cx.fillRect(0, 0, this.size.x, this.size.y);
        cx.restore();
    }
}

class Player extends Actor {
    vel = new Vector2(0, 0);
    size = new Vector2(2, 2);

    speed = .25;

    maxHealth = 5;
    health = this.maxHealth;
    healthBar = this.health;

    maxPower = 32;
    power = 0;
    powerBar = this.power;

    maxBomb = 3;
    bomb = this.maxBomb;
    
    constructor() {
        super();
    }

    takeHit = (game, other) => {
        if (this.invicibility || !this.health) return;
        game.stage.particles.ray(this.checkCollision(game, other).pos);
        game.stage.particles.impact(this.checkCollision(game, other).pos);
        if (this.health) {
            this.health--;
            this.power = Math.max(0, this.power - this.maxPower * .25);
            if (!this.health) {
                game.audio.playSE('player_death');
                game.audio.stopBGM(true);
                game.stage.particles.impact_2(this.checkCollision(game, other).pos);
                game.stage.nextStageFrame = 5 * 60;
                game.stage.nextStage = new Stage(game.stage.id);
                game.stage.hitPause = 60;
                game.stage.shakeBuffer = 30;
                this.stageFilter = true;
            } else {
                game.audio.playSE('player_hit');
                this.invicibility = 60;
                game.stage.hitPause = 12;
                game.stage.shakeBuffer = 12;
            }
        }
    }

    update = game => {
        // Keys
        this.keys = this.cpuControl ? game.cpuKeys : game.input.getKeys();

        // Directional input
        this.dirInput = new Vector2(
            this.keys.left === this.keys.right ? 0 : this.keys.right ? 1 : -1,
            this.keys.up === this.keys.down ? 0 : this.keys.down ? 1 : -1
        );

        // Focus
        this.focus = this.keys.c;

        // Direction
        this.dir = !this.dirInput ? this.dir : this.dirInput > 0;

        // Velocity
        this.vel = this.vel.times(.75);
        this.vel = this.vel.plus(this.dirInput.times(this.speed * (this.focus ? .5 : 1)));
        if (Math.abs(this.vel.x) < .1) this.vel.x = 0;
        if (Math.abs(this.vel.y) < .1) this.vel.y = 0;

        // Position

        ['x', 'y'].forEach(axis => {
            this.pos[axis] += this.vel[axis];
            if (this.pos[axis] < 0) {
                this.pos[axis] = 0;
                this.vel[axis] = 0;
            }
            if (this.pos[axis] + this.size[axis] > game.stage.size[axis]) {
                this.pos[axis] = game.stage.size[axis] - this.size[axis];
                this.vel[axis] = 0;
            }
        });

        // Bullet
        if (this.bulletBuffer) this.bulletBuffer = this.keys.a ? this.bulletBuffer - 1 : 0;
        if (this.keys.a && !this.bulletBuffer) {
            this.bulletBuffer = 8;

            const powerLevel = 1 + Math.floor((this.power / this.maxPower) * 4);
            for (let i = 0; i < powerLevel; i++) {
                const bullet = new Projectile(this.pos.plus(new Vector2(this.size.x * .5 - 1, -8)), actorData['bullet'][0], this);
                if (this.focus) {
                    bullet.pos.x += Math.sin(this.frameCount* 4 * (Math.PI / 180)) * 2 * i * (i % 2 ? 1 : -1);
                    bullet.vel = new Vector2(0, -4);
                } else {
                    const angle = -Math.PI * .5 + -Math.PI * .03125 * (powerLevel - 1) + Math.PI * .0625 * i;
                    bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(8);
                }
                game.stage.actors.push(bullet);
            }
        }

        // Bomb
        if (this.bombBuffer) this.bombBuffer--;
        else if (this.keys.b && this.bomb && !game.stage.isIntro && !game.stage.titleFrame) {
            this.bombBuffer = 30;
            game.audio.playSE('explosion');
            game.stage.actors.filter(a => a instanceof Projectile && a.originActor !== this).forEach(a => a.stageFilter = true);
            game.stage.actors.filter(a => a instanceof Enemy).forEach(a => {
                if (a.spriteOffset !== 2) a.health = 1;
                a.takeHit(game, a);
            });
            if (game.stage.boss) game.stage.boss.health = Math.max(0, game.stage.boss.health - 50 * (game.stage.boss.dangerZone ? .25 : 1));
            this.bomb--;
        }

        if (this.invicibility) this.invicibility--;
        this.frameCount++;
    }

    draw = (game, cx) => {
        if (this.invicibility % 2) return;
        cx.save();
        const center = CollisionBox.center(this).round();
        cx.translate(center.x, center.y);
        cx.drawImage(game.img['towa'], (1 + Math.sign(this.vel.x)) * 16, 0, 16, 16, -8, -8, 16, 16);
        if (this.focus) {
            cx.rotate(this.frameCount * (Math.PI / 180));
            cx.drawImage(game.img['focus'], 0, 0, 16, 16, -8, -8, 16, 16);
        }
        cx.restore();
    }
}

class Enemy extends Actor {
    vel = new Vector2(0, 0);
    size = new Vector2(8, 8);

    constructor(pos, actorData) {
        super(pos);
        this.action = actorData.action;
        this.maxHealth = actorData.maxHealth;
        this.health = this.maxHealth;
        this.spriteOffset = actorData.spriteOffset;
    }

    takeHit = (game, other) => {
        game.stage.particles.ray(this.checkCollision(game, other).pos);
        game.stage.particles.impact(this.checkCollision(game, other).pos);
        if (this.health) {
            this.health--;
            this.shakeBuffer = 12;
            if (!this.health) {
                game.audio.playSE('enemy_death');
                game.stage.particles.impact_2(this.checkCollision(game, other).pos);
                if (Math.random() > .5) game.stage.actors.push(new Item(CollisionBox.center(this), 0));
            } else {
                game.audio.playSE('enemy_hit');
            }
        }
    }

    update = game => {
        this.stageFilter = !this.health;
        this.action(game, this);

        if (game.stage.player.checkCollision(game, this)) game.stage.player.takeHit(game, this);

        if (this.shakeBuffer) this.shakeBuffer--;
        this.frameCount++;
    }

    draw = (game, cx) => {
        if (this.invicibility % 2) return;
        cx.save();
        const center = CollisionBox.center(this).round();
        cx.translate(center.x, center.y);
        if (this.shakeBuffer) cx.translate(Math.floor(Math.random() * 8) - 4, 0);
        cx.drawImage(game.img['angel'], (1 + Math.sign(this.vel.x)) * 16, this.spriteOffset * 16, 16, 16, -8, -8, 16, 16);
        cx.restore();
    }
}

class Boss extends Actor {
    vel = new Vector2(0, 0);
    size = new Vector2(8, 8);

    name = 'kanata';

    maxHealth = 400;
    health = this.maxHealth;
    dangerZone = false;

    phase = 2;
    phaseFrame = 0;

    speed = .5;

    constructor() {
        super();
    }

    takeHit = (game, other) => {
        if (this.invicibility) return;
        game.stage.particles.ray(this.checkCollision(game, other).pos);
        game.stage.particles.impact(this.checkCollision(game, other).pos);
        if (this.health) {
            this.health = Math.max(0, this.health - (this.dangerZone ? .25 : 1));
            this.shakeBuffer = 12;
            if (!this.health) {
                game.audio.playSE('boss_death');
                game.stage.particles.impact_2(this.checkCollision(game, other).pos);
            } else {
                game.audio.playSE('enemy_hit');
            }
        }
    }

    update = game => {
        this.pos = this.pos.plus(this.vel);
        if (game.stage.player.checkCollision(game, this)) game.stage.player.takeHit(game, this);

        // Movement
        if (this.targetPos) {
            const p1 = CollisionBox.center(this);
            const p2 = this.targetPos;
            if (p1.distance(p2) <= this.speed) {
                this.targetPos = null;
                this.vel = new Vector2(0, 0);
            } else {
                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                this.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(this.speed);
            }
        } else {
            if (this.dangerZone) this.targetPos = game.stage.size.mult(new Vector2(.5, .25));
            else if (!(this.frameCount % (7 * 60))) {
                const xRand = Math.random();
                const yRand = Math.random();
                this.targetPos = game.stage.size.mult(new Vector2(xRand < .3 ? .25 : xRand < .6 ? .5 : .75, yRand < .3 ? .15625 : yRand < .6 ? .25 : .34375));
            }
        }

        // Phase
        if (this.phaseFrame > 60 * 2) {
            if (this.dangerZone) {
                switch (this.phase) {
                    case 2:
                        const bullet = new Projectile(CollisionBox.center(this).plus(new Vector2(-1, -1)), actorData['bullet'][1], this);
                        bullet.vel = new Vector2(Math.cos(this.phaseFrame), Math.sin(this.phaseFrame)).times(.5).times(this.phaseFrame % 2 ? 1 : -1);
                        const bullet2 = new Projectile(CollisionBox.center(this).plus(new Vector2(-1, -1)), actorData['bullet'][1], this);
                        bullet2.vel = new Vector2(Math.sin(this.phaseFrame), Math.cos(this.phaseFrame)).times(.5).times(this.phaseFrame % 2 ? 1 : -1);
                        game.stage.actors.push(bullet, bullet2);
                        break;
                    case 1:
                        if (!(this.phaseFrame % 60)) {
                            game.audio.playSE('woosh');
                            for (let i = 0; i < game.stage.size.y / 24; i++) {
                                const bullet = new Projectile(new Vector2(-1 + (i % 2 ? game.stage.size.x : 0), -1 + i * 24), actorData['bullet'][3], this);
                                bullet.vel = new Vector2(.25 * (i % 2 ? -1 : 1), 0);
                                game.stage.actors.push(bullet);
                            }
                            for (let i = 0; i < game.stage.size.x / 24; i++) {
                                const bullet = new Projectile(new Vector2(3 + i * 24, -1 + (i % 2 ? game.stage.size.y : 0)), actorData['bullet'][3], this);
                                bullet.vel = new Vector2(0, .25 * (i % 2 ? -1 : 1));
                                game.stage.actors.push(bullet);
                            }
                        }
                        if (!(this.phaseFrame % 8)) {
                            const bullet = new Projectile(CollisionBox.center(this).plus(new Vector2(-1, -1)), actorData['bullet'][2], this);
                            bullet.vel = new Vector2(Math.sin(this.phaseFrame) * .25, Math.exp(Math.abs(Math.cos(this.phaseFrame))) * .25);
                            game.stage.actors.push(bullet);
                        }
                        break;
                    case 0:
                        if (!(this.phaseFrame % 60)) {
                            game.audio.playSE('woosh');
                            const p1 = CollisionBox.center(this);
                            const p2 = CollisionBox.center(game.stage.player);
                            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                            const bullet = new Projectile(p1, actorData['bullet'][5], this);
                            bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(.1);
                            bullet.angle = angle;
                            game.stage.actors.push(bullet);

                            for (let i = 0; i < 12; i++) {
                                const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + i * Math.PI / 6;
                                const bullet = new Projectile(p1, actorData['bullet'][2], this);
                                bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(.5);
                                const bullet2 = new Projectile(p1, actorData['bullet'][2], this);
                                bullet2.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                                game.stage.actors.push(bullet, bullet2);
                            }
                        }
                        break;
                    default:
                        break;
                }
            } else {
                if (!(this.phaseFrame % 3)) {
                    const bullet = new Projectile(CollisionBox.center(this).plus(new Vector2(-1, -1)), actorData['bullet'][3], this);
                    const angle = this.phaseFrame;
                    bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                    game.stage.actors.push(bullet);
                }

                if (!(this.phaseFrame % 30)) {
                    game.audio.playSE('woosh');
                    for (let i = 0; i < 6; i++) {
                        const bullet = new Projectile(new Vector2((!(this.phaseFrame % 60) ? 8 : 0) + i * 16 - 1, 0), actorData['bullet'][4], this);
                        game.stage.actors.push(bullet);
                    }
                }
            }
        }

        if (!this.health) {
            if (this.phase) {
                game.audio.playSE('explosion');
                this.phase--;
                this.phaseFrame = 0;
                this.health = this.maxHealth;
                this.dangerZone = false;
                game.stage.actors.filter(a => a instanceof Projectile && a.originActor === this).forEach(a => a.stageFilter = true);
                game.stage.shakeBuffer = 12;
                this.invicibility = 60 * 2;
                if (game.stage.player.power === game.stage.player.maxPower) {
                    game.stage.actors.push(new Item(CollisionBox.center(this).plus(new Vector2(-5, -5)), 1));
                } else {
                    for (let i = 0; i < 8; i++) {
                        game.stage.actors.push(new Item(CollisionBox.center(this).plus(new Vector2(Math.floor(Math.random() * 8) - 4, Math.floor(Math.random() * 8) - 4)), 0));
                    }
                }
            } else {
                this.stageFilter = true;
                game.stage.isCleared = true;
                game.stage.score = 5000 * game.stage.player.health + 3000 * game.stage.player.bomb + 500 * game.stage.player.power;
                game.stage.boss = null;
                game.stage.actors.filter(a => a instanceof Projectile).forEach(a => a.stageFilter = true);
                game.stage.shakeBuffer = 30;
            }
        } else {
            if (!this.dangerZone && this.health < this.maxHealth * .25) {
                this.phaseFrame = 0;
                this.dangerZone = true;
                game.audio.playSE('boss_death');
                game.stage.actors.filter(a => a instanceof Projectile && a.originActor === this).forEach(a => a.stageFilter = true);
                game.stage.shakeBuffer = 12;
                this.invicibility = 60 * 2;
                if (game.stage.player.power === game.stage.player.maxPower) {
                    game.stage.actors.push(new Item(CollisionBox.center(this).plus(new Vector2(-5, -5)), 1));
                } else {
                    for (let i = 0; i < 8; i++) {
                        game.stage.actors.push(new Item(CollisionBox.center(this).plus(new Vector2(Math.floor(Math.random() * 8) - 4, Math.floor(Math.random() * 8) - 4)), 0));
                    }
                }
            }
        }

        if (this.invicibility) this.invicibility--;
        if (this.shakeBuffer) this.shakeBuffer--;
        this.phaseFrame++;
        this.frameCount++;
    }

    draw = (game, cx) => {
        if (this.invicibility % 2) return;
        cx.save();
        const center = CollisionBox.center(this).round();
        cx.translate(center.x, center.y);
        if (this.shakeBuffer) cx.translate(Math.floor(Math.random() * 8) - 4, 0);
        cx.drawImage(game.img[this.name], (1 + Math.sign(this.vel.x)) * 16, 0, 16, 16, -8, -8, 16, 16);
        cx.restore();
    }
}

class Projectile extends Actor {

    constructor(pos, actorData, originActor) {
        super(pos, actorData.size);
        this.vel = actorData.vel.value();
        this.action = actorData.action;
        this.spriteOffset = actorData.spriteOffset;
        this.originActor = originActor;
    }
    
    update = game => {
        this.action(game, this);

        let collision = false;

        const actorCollisions = game.stage.actors.filter(actor => (this.originActor === game.stage.player ? (actor instanceof Enemy || actor instanceof Boss) : actor === game.stage.player) && actor.checkCollision(game, this));
        if (actorCollisions.length) {
            actorCollisions.forEach(collision => {
                collision.takeHit(game, this);
            });
            collision = true;
        }

        if (!CollisionBox.intersects(this, game.stage) || collision) this.stageFilter = true;

        this.frameCount++;
    }
    
    draw = (game, cx) => {
        cx.save();
        const center = CollisionBox.center(this).round();
        cx.translate(center.x, center.y);
        if (this.spriteOffset === 3) {
            cx.rotate(this.frameCount * 8 * (Math.PI / 180));
        }
        cx.drawImage(game.img['bullet'], 8 * this.spriteOffset, 0, 8, 8, -4, -4, 8, 8);
        cx.restore();
    }
}

class Item extends Actor {
    vel = new Vector2(0, -1);
    size = new Vector2(10, 10);

    gravity = .0625;

    constructor(pos, type) {
        super(pos);
        this.type = type;
    }
    
    update = game => {
        this.vel.y = Math.min(1, this.vel.y + this.gravity);
        this.pos = this.pos.plus(this.vel);

        if (CollisionBox.intersects(game.stage.player, this)) {
            if (!this.type) game.stage.player.power = Math.min(game.stage.player.maxPower, game.stage.player.power + 1);
            else game.stage.player.bomb = Math.min(game.stage.player.maxBomb, game.stage.player.bomb + 1);
            this.stageFilter = true;
            game.audio.playSE('item');
        }

        if (this.pos.y > game.stage.size.y) this.stageFilter = true;

        this.frameCount++;
    }
    
    draw = (game, cx) => {
        cx.save();
        const center = CollisionBox.center(this).round();
        cx.translate(center.x, center.y);
        cx.drawImage(game.img['item'], this.type * 8, 0, 8, 8, -4, -4, 8, 8);
        cx.restore();
    }
}