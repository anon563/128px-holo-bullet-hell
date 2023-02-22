class ParticleManager {
    pool = [];

    update = () => {
        this.pool = this.pool.filter(particle => particle.life < particle.lifespan);
        this.pool.forEach(particle => particle.update());
    }

    draw = (cx, game, zIndex) => {
        this.pool.filter(particle => particle.zIndex === zIndex).forEach(particle => particle.draw(cx, game));
    }

    impact = pos => {
        this.pool.push(new Particle({
            type: `impact`,
            pos: pos,
            size: new Vector2(16, 16),
            xOffset: p => p.size.x * Math.floor(p.life * 2 / p.lifespan),
            vel: new Vector2(0, 0),
            lifespan: 4,
            zIndex: 1
        }));
    }
    
    impact_2 = pos => {
        this.pool.push(new Particle({
            type: `impact_2`,
            pos: pos,
            size: new Vector2(24, 24),
            xOffset: p => p.size.x * Math.floor(p.life * 4 / p.lifespan),
            vel: new Vector2(0, 0),
            lifespan: 8,
            zIndex: 1
        }));
    }
    
    ray = pos => {
        for (let i = 0; i < 2; i++) {
            this.pool.push(new Particle({
                type: `ray_${Math.ceil(Math.random() * 4)}`,
                pos: pos,
                size: new Vector2(64, 64),
                vel: new Vector2(0, 0),
                lifespan: 1,
                zIndex: 1,
                delay: i * 4
            }));
        }
    }
}

class Particle {
    life = 0;

    constructor(data) {
        const {
            type,
            pos,
            size,
            offset,
            vel,
            lifespan,
            delay,
            rotate,
            scale,
            zIndex
        } = data;
        Object.assign(this, data);
    }

    update = () => {
        if (this.delay) this.delay--;
        else {
            this.pos = this.pos.plus(this.vel);
            this.life++;
        }
    }

    draw = (cx, game) => {
        if (this.delay) return;
        cx.save();
        cx.translate(this.pos.x, this.pos.y);
        if (this.rotate) cx.rotate(this.rotate(this));
        if (this.scale) cx.scale(...this.scale(this));
        const xOffset = this.xOffset ? this.xOffset(this) : 0;
        cx.drawImage(game.img[`vfx_${this.type}`], xOffset, 0, this.size.x, this.size.y, -this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
        cx.restore();
    }
}