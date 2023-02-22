const stageData = [
    {
        timeline: new Map([
            [1, game => {
                for (let i = 0; i < 6; i++) {
                    const angel = new Enemy(new Vector2(16, -i * 16 - 16), actorData['angel'][0]);
                    game.stage.actors.push(angel);
                }
            }],
            [5, game => {
                for (let i = 0; i < 6; i++) {
                    const angel = new Enemy(new Vector2(game.stage.size.x - 16, -i * 16 - 16), actorData['angel'][1]);
                    game.stage.actors.push(angel);
                }
            }],

            [9, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 12, -16), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(4, -16), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            [11, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 24, -16), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(16, -16), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            [13, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 36, -16), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(28, -16), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            
            [15, game => {
                for (let i = 0; i < 10; i++) {
                    const angel = new Enemy(new Vector2(8 * i, -i * 8 - 16), actorData['angel'][i % 2]);
                    game.stage.actors.push(angel);
                }
            }],
            [18, game => {
                for (let i = 0; i < 10; i++) {
                    const angel = new Enemy(new Vector2(8 * i, -i * 8 - 16), actorData['angel'][1 - (i % 2)]);
                    game.stage.actors.push(angel);
                }
            }],
            [21, game => {
                for (let i = 0; i < 10; i++) {
                    const angel = new Enemy(new Vector2(8 * i, -i * 8 - 16), actorData['angel'][i % 2]);
                    game.stage.actors.push(angel);
                }
            }],
            
            [30, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x * .5 - 4, -16), actorData['angel'][4]);
                game.stage.actors.push(angel);
            }],
            
            [40, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 24, -16), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(16, -32), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            [42, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 12, -32), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(28, -16), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            [44, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 36, -16), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(4, -32), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            [46, game => {
                const angel = new Enemy(new Vector2(game.stage.size.x - 12, -32), actorData['angel'][2]);
                const angel2 = new Enemy(new Vector2(28, -16), actorData['angel'][3]);
                game.stage.actors.push(angel, angel2);
            }],
            
            [50, game => {
                for (let i = 0; i < 6; i++) {
                    const angel = new Enemy(new Vector2(16, -i * 16 - 16), actorData['angel'][0]);
                    const angel2 = new Enemy(new Vector2(24, -i * 16 - 16), actorData['angel'][0]);
                    game.stage.actors.push(angel, angel2);
                }
            }],
            [54, game => {
                for (let i = 0; i < 6; i++) {
                    const angel = new Enemy(new Vector2(game.stage.size.x - 16, -i * 16 - 16), actorData['angel'][1]);
                    const angel2 = new Enemy(new Vector2(game.stage.size.x - 24, -i * 16 - 16), actorData['angel'][1]);
                    game.stage.actors.push(angel, angel2);
                }
            }],

            [60, game => {
                const boss = new Boss();
                boss.pos = new Vector2(game.stage.size.x * .5, -8).plus(boss.size.times(-.5));
                boss.targetPos = game.stage.size.mult(new Vector2(.5, .25));

                game.stage.actors.push(boss);
                game.stage.boss = boss;
            }]
        ])
    }
];