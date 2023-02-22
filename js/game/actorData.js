const actorData = {
    angel: {
        0: {
            spriteOffset: 0,
            maxHealth: 2,
            action: (game, actor) => {
                actor.vel = new Vector2(actor.pos.y < 0 ? 0 : actor.pos.y * .005, .5);
                actor.pos = actor.pos.plus(actor.vel);
                
                if (actor.pos.y > game.stage.size.y * .25 && !actor.bulletBuffer) {
                    actor.bulletBuffer = true;
                    const p1 = CollisionBox.center(actor);
                    const p2 = CollisionBox.center(game.stage.player);
                    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    const bullet = new Projectile(p1, actorData['bullet'][3], actor);
                    bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                    game.stage.actors.push(bullet);
                }

                if (actor.pos.y > game.stage.size.y) actor.stageFilter = true;
            }
        },
        1: {
            spriteOffset: 0,
            maxHealth: 2,
            action: (game, actor) => {
                actor.vel = new Vector2(-(actor.pos.y < 0 ? 0 : actor.pos.y * .005), .5);
                actor.pos = actor.pos.plus(actor.vel);
                
                if (actor.pos.y > game.stage.size.y * .25 && !actor.bulletBuffer) {
                    actor.bulletBuffer = true;
                    const p1 = CollisionBox.center(actor);
                    const p2 = CollisionBox.center(game.stage.player);
                    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                    const bullet = new Projectile(p1, actorData['bullet'][3], actor);
                    bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                    game.stage.actors.push(bullet);
                }

                if (actor.pos.y > game.stage.size.y) actor.stageFilter = true;
            }
        },
        2: {
            spriteOffset: 1,
            maxHealth: 4,
            action: (game, actor) => {
                actor.vel = new Vector2(actor.frameCount < 240 ? 0 : .25, actor.pos.y > 16 ? 0 : .5);
                actor.pos = actor.pos.plus(actor.vel);
                if (actor.pos.x > game.stage.size.x) actor.stageFilter = true;

                if (actor.frameCount === 120) {
                    game.audio.playSE('woosh');
                    const p1 = CollisionBox.center(actor);
                    const p2 = CollisionBox.center(game.stage.player);
                    for (let i = -3; i < 5; i++) {
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + i * Math.PI * .0625;
                        const bullet = new Projectile(p1, actorData['bullet'][1], actor);
                        bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(.5);
                        game.stage.actors.push(bullet);
                    }
                }
            }
        },
        3: {
            spriteOffset: 1,
            maxHealth: 4,
            action: (game, actor) => {
                actor.vel = new Vector2(actor.frameCount < 240 ? 0 : -.25, actor.pos.y > 16 ? 0 : .5);
                actor.pos = actor.pos.plus(actor.vel);
                if (actor.pos.x + actor.size.x < 0) actor.stageFilter = true;
                
                if (actor.frameCount === 120) {
                    game.audio.playSE('woosh');
                    const p1 = CollisionBox.center(actor);
                    const p2 = CollisionBox.center(game.stage.player);
                    for (let i = -3; i < 5; i++) {
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + i * Math.PI * .0625;
                        const bullet = new Projectile(p1, actorData['bullet'][1], actor);
                        bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(.5);
                        game.stage.actors.push(bullet);
                    }
                }
            }
        },
        4: {
            spriteOffset: 2,
            maxHealth: 1000,
            action: (game, actor) => {
                actor.vel = new Vector2(0, 0);

                if (actor.frameCount < 60) actor.vel.y = .75;

                if (actor.frameCount > 60 && actor.frameCount < 60 * 10 && !(actor.frameCount % 60)) {
                    game.audio.playSE('woosh');
                    const p1 = CollisionBox.center(actor);
                    const p2 = CollisionBox.center(game.stage.player);
                    for (let i = 0; i < 32; i++) {
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) + i * Math.PI * .0625;
                        const bullet = new Projectile(p1, actorData['bullet'][2], actor);
                        bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle)).times(.5);
                        const bullet2 = new Projectile(p1, actorData['bullet'][2], actor);
                        bullet2.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                        game.stage.actors.push(bullet, bullet2);
                    }
                }

                if (actor.frameCount >= 60 * 10) {
                    actor.vel = new Vector2(.5, -.5);
                    if (actor.frameCount === 60 * 10 && actor.health < 900) game.stage.actors.push(new Item(CollisionBox.center(actor), 1));
                }

                actor.pos = actor.pos.plus(actor.vel);
                if (actor.frameCount > 60 * 15) actor.stageFilter = true;
            }
        },
    },
    bullet: {
        0: {
            spriteOffset: 0,
            size: new Vector2(2, 2),
            vel: new Vector2(0, -4),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel);
            }
        },
        1: {
            spriteOffset: 1,
            size: new Vector2(2, 2),
            vel: new Vector2(0, 0),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel.times(actor.frameCount < 15 ? 3 : 1));
            }
        },
        2: {
            spriteOffset: 2,
            size: new Vector2(2, 2),
            vel: new Vector2(0, 0),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel.times(actor.frameCount < 15 ? 3 : 1));
            }
        },
        3: {
            spriteOffset: 1,
            size: new Vector2(2, 2),
            vel: new Vector2(0, 0),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel);
            }
        },
        4: {
            spriteOffset: 2,
            size: new Vector2(2, 2),
            vel: new Vector2(0, 1),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel);
            }
        },
        5: {
            spriteOffset: 3,
            size: new Vector2(2, 2),
            vel: new Vector2(0, 1),
            action: (game, actor) => {
                actor.pos = actor.pos.plus(actor.vel);
                actor.vel = actor.vel.times(1.02);
                
                if (actor.frameCount > 30 && !(actor.frameCount % 30)) {
                    const angle = actor.angle - Math.PI;
                    const bullet = new Projectile(actor.pos, actorData['bullet'][3], actor);
                    bullet.vel = new Vector2(Math.cos(angle), Math.sin(angle));
                    game.stage.actors.push(bullet);
                }
            }
        }
    }
}