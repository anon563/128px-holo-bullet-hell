class Game {
    width = 128;
    height = 128;

    tick = 60;
    
    resolution = 'auto';
    fullscreen = false;

    input = new InputManager();

    constructor(assets) {
        this.assets = assets;

        // Display layers
        this.container = document.createElement("div");
        document.body.appendChild(this.container);
        this.container.id = 'game-container';
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        for (let i = 0; i < 4; i++) {
            this[`canvas${i}`] = document.createElement("canvas");
            this.container.appendChild(this[`canvas${i}`]);
            this[`canvas${i}`].id = `layer${i}`;
            this[`canvas${i}`].style.zIndex = i;
            this[`canvas${i}`].width = this.width;
            this[`canvas${i}`].height = this.height;
            this[`ctx${i}`] = this[`canvas${i}`].getContext('2d');
            this[`ctx${i}`].imageSmoothingEnabled = false;
        }

        this.resize();
        window.addEventListener('resize', this.resize);

        this.img = assets.imgList;

        this.audio = new AudioManager(assets);

        this.stage = new Stage(0);
    }

    start = () => {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 1000 / this.tick);
        this.animationFrame = requestAnimationFrame(this.draw);
    }

    update = () => {
        this.audio.update();
        this.input.update();
        this.stage.update(this);
    }

    draw = () => {
        this.animationFrame = requestAnimationFrame(this.draw);
        this.stage.draw(this);
    }

    resize = () => {
        const scaleX = innerWidth / this.width;
        const scaleY = innerHeight / this.height;
        let scale = Math.max(1, Math.min(scaleX, scaleY));
        if (this.resolution === 'auto') scale = Math.floor(scale);
        this.container.style.transform = 'scale(' + scale + ')';
    }
}