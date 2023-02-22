class KeyboardListener {
    keys = { up: false, left: false, down: false, right: false, a: false, b: false, c: false }
    keyCodes = {
        ArrowUp: 'up',
        ArrowLeft: 'left',
        ArrowDown: 'down',
        ArrowRight: 'right',
        KeyZ: 'a',
        KeyX: 'b',
        ShiftLeft: 'c'
    }

    constructor() {
        this.enable();
    }

    enable = () => {
        document.body.onkeydown = e => this.handler(e);
        document.body.onkeyup = e => this.handler(e);
    }

    disable = () => {
        document.body.onkeydown = null;
        document.body.onkeyup = null;
    }

    updateKeys = () => {}

    handler = e => {
        if (e.code in this.keyCodes) {
            this.keys[this.keyCodes[e.code]] = e.type === 'keydown';
            e.preventDefault();
        }
    }
}

class GamepadListener {
    keys = new Object;

    constructor(id) {
        this.id = id;
        this.updateKeys();
    }

    updateKeys = () => {
        const keys = new Object;
        const gamepad = navigator.getGamepads()[this.id];
        if (gamepad) {
            keys.up = (gamepad.axes[1] && gamepad.axes[1] < -0.5) || (gamepad.buttons[12] && gamepad.buttons[12].value === 1);
            keys.left = (gamepad.axes[0] && gamepad.axes[0] < -0.5) || (gamepad.buttons[14] && gamepad.buttons[14].value === 1);
            keys.down = (gamepad.axes[1] && gamepad.axes[1] > 0.5) || (gamepad.buttons[13] && gamepad.buttons[13].value === 1);
            keys.right = (gamepad.axes[0] && gamepad.axes[0] > 0.5) || (gamepad.buttons[15] && gamepad.buttons[15].value === 1);
            keys.a = gamepad.buttons[0] && gamepad.buttons[0].value === 1;
            keys.b = gamepad.buttons[1] && gamepad.buttons[1].value === 1;
            keys.c = gamepad.buttons[2] && gamepad.buttons[2].value === 1;
        }
        this.keys = keys;
    }
}

class InputManager {
    inputs = [new KeyboardListener];
    id = 0;

    constructor() {
        window.addEventListener('gamepadconnected', event => {
            console.log(`Gamepad connected at index ${event.gamepad.index}: ${event.gamepad.id}`);
            this.inputs.push(new GamepadListener(event.gamepad.index));
            this.id++;
        });
        window.addEventListener('gamepaddisconnected', event => {
            console.log(`Gamepad disconnected from index ${event.gamepad.index}: ${event.gamepad.id}`);
            this.inputs = this.inputs.filter(player => player.id !== event.gamepad.index);
        });
    }

    getKeys = () => this.inputs[this.id].keys;

    getAllKeys = () => {
        const keys = new Object;
        this.inputs.forEach(input => {
            const inputKeys = input.keys;
            if (inputKeys.up) keys.up = true;
            if (inputKeys.left) keys.left = true;
            if (inputKeys.down) keys.down = true;
            if (inputKeys.right) keys.right = true;
            if (inputKeys.a) keys.a = true;
            if (inputKeys.b) keys.b = true;
            if (inputKeys.c) keys.c = true;
        });
        return keys;
    }

    update = () => this.inputs[this.id].updateKeys();
}