class Stage {
    frameCount = 0;

    introFrame = 60;
    isIntro = this.introFrame;
    isCleared = false;

    pos = new Vector2(0, 0);
    size = new Vector2(80, 128);

    particles = new ParticleManager();

    shakeBuffer = 0;

    actors = [];

    timelineIndex = 0;
    timelineBuffer = false;

    constructor(id) {
        const data = stageData[id];
        this.id = id;

        this.timeline = data.timeline;

        this.player = new Player();
        this.player.pos = this.size.mult(new Vector2(.5, .9)).plus(this.player.size.times(-.5));
        this.actors.push(this.player);
    }

    update = game => {
        // check scene pause
        if (this.hitPause) {
            this.hitPause--;
            return;
        }

        // Intro
        if (this.titleFrame) {
            this.titleFrame--;
            if (!this.titleFrame) this.timelineBuffer = true;
        }
        if (this.isIntro) {
            const keys = game.input.getKeys();
            if (this.isIntro < this.introFrame || Object.keys(keys).some(key => keys[key])) {
                if (game.audio.ctx.state === 'suspended') game.audio.ctx.resume();
                this.isIntro--;
                if (!this.isIntro) {
                    this.titleFrame = 180;
                    game.audio.playBGM('fact');
                }
            }
        }

        // Timeline
        if (this.timelineBuffer) {
            if (this.timeline.has(this.timelineIndex / 60)) this.timeline.get(this.timelineIndex / 60)(game);
            this.timelineIndex++;
        }

        // Update particles
        this.particles.update();

        // Update actors
        this.actors = this.actors.filter(actor => !actor.stageFilter);
        this.actors.forEach(actor => actor.update(game));

        // Player health bar
        if (this.player.healthBar !== this.player.health) {
            this.player.healthBar = (1 - .1) * this.player.healthBar + .1 * this.player.health;
            if (Math.abs(this.player.healthBar - this.player.health) < .01) this.player.healthBar = this.player.health;
        }
        // Player power bar
        if (this.player.powerBar !== this.player.power) {
            this.player.powerBar = (1 - .1) * this.player.powerBar + .1 * this.player.power;
            if (Math.abs(this.player.powerBar - this.player.power) < .01) this.player.powerBar = this.player.power;
        }

        // End
        if (this.nextStage) {
            this.nextStageFrame--;
            if (!this.nextStageFrame) game.stage = this.nextStage;
        }

        if (this.shakeBuffer) this.shakeBuffer--;
        this.frameCount++;
    }
    
    draw = game => {
        for (let i = 0; i < 4; i++) {
            const cx = game[`ctx${i}`];
            cx.save();
            if (this.shakeBuffer) cx.translate(Math.floor(Math.random() * 8) - 4, 0);
            switch (i) {
                case 0:
                    cx.clearRect(0, 0, game.width, game.height);

                    // Background
                    const yOffset = Math.floor(this.frameCount * .25) % 128;
                    const yOffset2 = Math.floor(this.frameCount * .375) % 128;
                    cx.drawImage(game.img['background'], 0, 0, 80, 128, 0, -128 + yOffset, 80, 128);
                    cx.drawImage(game.img['background'], 0, 0, 80, 128, 0, yOffset, 80, 128);
                    cx.drawImage(game.img['island'], 0, 0, 80, 128, 0, -128 + yOffset2, 80, 128);
                    cx.drawImage(game.img['island'], 0, 0, 80, 128, 0, yOffset2, 80, 128);

                    // Cloud
                    cx.save();
                    cx.translate(40, 0);
                    for (let i = 0; i < 2; i++) {
                        for (let j = 0; j < 2; j++) {
                            cx.save();
                            const yOffset = (Math.floor(this.frameCount * .5 * (j ? 2 : 1)) + (i * 64)) % 128;
                            if (i) cx.scale(-1, 1);
                            cx.drawImage(game.img['cloud'], j * 24, 0, 24, 128, -40 - 12 * j, -128 + yOffset, 24, 128);
                            cx.drawImage(game.img['cloud'], j * 24, 0, 24, 128, -40 - 12 * j, yOffset, 24, 128);
                            cx.restore();
                        }
                    }
                    cx.restore();
                    
                    // Boss danger zone
                    if (this.boss && this.boss.dangerZone) {
                        cx.fillStyle = '#00003F7F';
                        cx.fillRect(0, 0, this.size.x, this.size.y);
                    }
                    break;
                case 1:
                    cx.clearRect(0, 0, game.width, game.height);
                    this.particles.draw(cx, game, 0);
                    this.actors.forEach(actor => actor.draw(game, cx));
                    if (DEBUGMODE) this.actors.forEach(a => a.displayCollisionBox(game, cx));
                    this.particles.draw(cx, game, 1);
                    break;
                case 2:
                    cx.clearRect(0, 0, game.width, game.height);
                    break;
                case 3:
                    cx.clearRect(0, 0, game.width, game.height);

                    // Bomb
                    if (this.player.bombBuffer) {
                        cx.save();
                        cx.fillStyle = '#000';
                        cx.globalAlpha = this.player.bombBuffer / 30;
                        cx.fillRect(0, 0, this.size.x, this.size.y);
                        cx.beginPath();
                        cx.arc(this.player.pos.x + this.player.size.x * .5, this.player.pos.y + this.player.size.y * .5, this.size.x * (1 - this.player.bombBuffer / 30), 0, 2 * Math.PI);
                        cx.fill();
                        cx.drawImage(game.img['bibi'], 0, 0, 48, 24, this.size.x * .5 - 24, this.size.y * .5 - 12, 48, 24);
                        cx.restore();
                    }

                    // HUD
                    cx.save();
                    cx.translate(this.size.x, 0);
                    cx.drawImage(game.img['hud'], 0, 0, 48, 128, 0, 0, 48, 128);
                    cx.restore();

                    // Health
                    cx.save();
                    cx.translate(84, 53);
                    const healthBarLength = 32;
                    const healthRatio = this.player.healthBar / this.player.maxHealth;
                    const healthBar = Math.ceil(healthBarLength * healthRatio);
                    cx.fillStyle = '#003F7F';
                    cx.fillRect(4, 2, healthBar, 4);
                    cx.fillStyle = '#007FBF';
                    cx.fillRect(4, 3, healthBar, 2);
                    if (healthRatio && healthRatio < 1) {
                        cx.fillStyle = '#7F7FBF';
                        cx.fillRect(3 + healthBar, 2, 1, 4);
                        cx.fillStyle = '#FFFFFF';
                        cx.fillRect(3 + healthBar, 3, 1, 2);
                    }
                    cx.restore();
                    
                    // Bombs
                    cx.save();
                    cx.translate(84, 69);
                    for (let i = 0; i < this.player.bomb; i++) {
                        cx.fillStyle = '#009F3F';
                        cx.fillRect(4 + 13 * i, 2, 6, 4);
                        cx.fillStyle = '#00FF7F';
                        cx.fillRect(4 + 13 * i, 3, 6, 2);
                    }
                    cx.restore();

                    // Power
                    cx.save();
                    cx.translate(84, 85);
                    const powerBarLength = 32;
                    const powerBar = Math.ceil(powerBarLength * this.player.powerBar / this.player.maxPower);
                    cx.fillStyle = '#7F003F';
                    cx.fillRect(4, 2, powerBar, 4);
                    cx.fillStyle = '#FF003F';
                    cx.fillRect(4, 3, powerBar, 2);
                    if (this.player.power && this.player.power < this.player.maxPower) {
                        cx.fillStyle = '#BF7FBF';
                        cx.fillRect(3 + powerBar, 2, 1, 4);
                        cx.fillStyle = '#FFFFFF';
                        cx.fillRect(3 + powerBar, 3, 1, 2);
                    }
                    cx.restore();

                    // Boss
                    if (this.boss) {
                        cx.drawImage(game.img[`${this.boss.name}_title`], 0, 0, 80, 12, 0, 0, 80, 12);
                        for (let i = 0; i < this.boss.phase; i++) {
                            cx.drawImage(game.img['phase'], 0, 0, 8, 8, 64 + 8 * i, 0, 8, 8);
                        }
                        
                        // Health
                        cx.save();
                        cx.translate(2, 10);
                        const healthBarLength = 76;
                        const healthRatio = this.boss.health / this.boss.maxHealth;
                        const healthBar = Math.ceil(healthBarLength * healthRatio);
                        cx.fillStyle = '#FFFFFF';
                        cx.fillRect(0, 0, healthBar, 1);
                        cx.restore();
                        if (healthRatio && healthRatio > .25) {
                            cx.fillStyle = '#FFFFFF';
                            cx.fillRect(21, 9, 1, 3);
                        }
                    }

                    // Title
                    if (this.titleFrame && this.titleFrame < 150 && (this.titleFrame > 30 || !(Math.floor(this.titleFrame * .5) % 2))) cx.drawImage(game.img['title'], 0, 0, 72, 16, 4, game.height * .5 - 8, 72, 16);
                    if (this.isIntro > 0 && !(Math.floor(this.isIntro * .5) % 2)) cx.drawImage(game.img['controls'], 0, 0, 72, 48, 4, game.height * .5 - 24, 72, 48);

                    // Clear
                    if (this.isCleared) {
                        cx.save();
                        cx.translate(0, game.height * .5 - 24);
                        cx.drawImage(game.img['stage_clear'], 0, 0, 80, 48, 0, 0, 80, 48);
                        Array.from(this.score.toString()).forEach((digit, i) => {
                            cx.drawImage(game.img['digit'], digit * 6, 0, 6, 7, 42 + 5 * i, 40, 6, 7);
                        });
                        cx.restore();
                    }
                    
                    // Start transition
                    if (this.frameCount < 30) {
                        cx.fillStyle = '#000';
                        cx.globalAlpha = 1 - this.frameCount / 30;
                        cx.fillRect(0, 0, game.width, game.height);
                    }
                    // End transition
                    if (this.nextStage && this.nextStageFrame < 60) {
                        cx.fillStyle = '#000';
                        cx.globalAlpha = 1 - this.nextStageFrame / 60;
                        cx.fillRect(0, 0, game.width, game.height);
                    }
                    break;
            }
            cx.restore();
        }
    }
}