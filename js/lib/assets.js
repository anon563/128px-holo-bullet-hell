class Assets {
    imgList = new Object;
    imgData = [
        'towa',
        'kanata',
        'kanata_title',
        'angel',
        'bullet',
        'hud',
        'focus',
        'cloud',
        'title',
        'stage_clear',
        'controls',
        'background',
        'item',
        'island',
        'phase',
        'bibi',
        'digit',

        'vfx_impact',
        'vfx_impact_2',
        'vfx_ray_1',
        'vfx_ray_2',
        'vfx_ray_3',
        'vfx_ray_4'
    ];

    seList = new Object;
    seData = [
        'boss_death',
        'enemy_death',
        'player_death',
        'enemy_hit',
        'player_hit',
        'item',
        'explosion',
        'woosh'
    ];
    
    bgmList = new Object;
    bgmData = [
        {
            id: "fact",
            loopStart: 18.252
        }
    ];

    load = game => new Promise(resolve => this.loadImages().then(() => this.loadAudio(game).then(() => resolve())));

    loadAudio = game => Promise.all([
        ...this.bgmData.map(({id, loopStart}) => {
            return new Promise(resolve => {
                fetch(`bgm/${id}.wav`).then(res => res.arrayBuffer()).then(buffer => {
                    game.audio.ctx.decodeAudioData(buffer, decodedData => {
                        this.bgmList[id] = {
                            buffer: decodedData,
                            loopStart: loopStart
                        }
                        resolve();
                    });
                });
            });
        }),
        ...this.seData.map(id => {
            return new Promise(resolve => {
                fetch(`se/${id}.wav`).then(res => res.arrayBuffer()).then(buffer => {
                    game.audio.ctx.decodeAudioData(buffer, decodedData => {
                        this.seList[id] = { buffer: decodedData };
                        resolve();
                    });
                });
            });
        })
    ]);

    loadImages = () => Promise.all(this.imgData.map(id => new Promise(resolve => {
        this.imgList[id] = new Image;
        this.imgList[id].src = `img/${id}.png`;
        this.imgList[id].onload = () => resolve();
    })));
}