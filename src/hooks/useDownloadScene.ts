import * as PIXI from 'pixi.js';

interface SceneRefs {
    texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>;
    assetsRef: React.MutableRefObject<{ [key: string]: any }>;
    scenesRef: React.MutableRefObject<{ [key: string]: PIXI.Container }>;
}

export const initDownloadScene = (scene: PIXI.Container, refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;

    // Office background
    const officeBg = new PIXI.Sprite(texturesRef.current.officeBg);
    officeBg.width = window.innerWidth;
    officeBg.height = window.innerHeight;
    scene.addChild(officeBg);
    assetsRef.current.officeBg = officeBg;

    // Table
    const table = new PIXI.Sprite(texturesRef.current.table);
    table.anchor.set(0.5, 0.5);
    table.scale.set(1.5);
    table.x = window.innerWidth / 2 + 270;
    table.y = window.innerHeight - table.height / 2 - 50;
    scene.addChild(table);
    assetsRef.current.table = table;

    // Monitor
    const monitor = new PIXI.Sprite(texturesRef.current.monitor);
    monitor.anchor.set(0.5, 0.5);
    monitor.scale.set(1.5);
    monitor.x = table.x;
    monitor.y = table.y - 0;
    scene.addChild(monitor);
    assetsRef.current.monitor = monitor;

    // Coffee cup
    const coffeeCup = new PIXI.Sprite(texturesRef.current.cup1);
    coffeeCup.anchor.set(0.5, 0.5);
    coffeeCup.scale.set(1.5);
    coffeeCup.x = table.x + 60;
    coffeeCup.y = table.y - 0;
    scene.addChild(coffeeCup);
    assetsRef.current.coffeeCup = coffeeCup;

    // Characters container
    const charactersContainer = new PIXI.Container();
    scene.addChild(charactersContainer);

    // Sleeping man
    const snoringMan = new PIXI.Sprite(texturesRef.current.snoring1);
    snoringMan.anchor.set(0.5, 0.5);
    snoringMan.scale.set(1.5);
    snoringMan.x = table.x - 30;
    snoringMan.y = table.y + 72;
    charactersContainer.addChild(snoringMan);

    // Web woman
    const webWoman = new PIXI.Sprite(texturesRef.current.webwoman1);
    webWoman.anchor.set(0.5, 0.5);
    webWoman.scale.set(1.5);
    webWoman.x = table.x + 25;
    webWoman.y = table.y + 0;
    charactersContainer.addChild(webWoman);

    assetsRef.current.characters = {
        snoringMan,
        webWoman,
        animationState: {
            snoringFrame: 0,
            snoringFrameTimer: 0,
            webWomanFrame: 0,
            webWomanFrameTimer: 0,
            cupFrame: 0,
            cupFrameTimer: 0
        }
    };
};

export const updateDownloadScene = (refs: SceneRefs) => {
    const { texturesRef, assetsRef, scenesRef } = refs;
    if (!scenesRef.current.download?.visible || !assetsRef.current.characters) return;

    const characters = assetsRef.current.characters;
    const animState = characters.animationState;

    // Snoring man animation
    animState.snoringFrameTimer += 1;
    if (animState.snoringFrameTimer > 10) {
        animState.snoringFrameTimer = 0;
        animState.snoringFrame = (animState.snoringFrame + 1) % 5;
        const frameTexture = texturesRef.current[`snoring${animState.snoringFrame + 1}`];
        if (frameTexture && characters.snoringMan) {
            characters.snoringMan.texture = frameTexture;
        }
    }

    // Web woman animation
    animState.webWomanFrameTimer += 1;
    if (animState.webWomanFrameTimer > 30) {
        animState.webWomanFrameTimer = 0;
        animState.webWomanFrame = animState.webWomanFrame === 0 ? 1 : 0;
        const frameTexture = texturesRef.current[`webwoman${animState.webWomanFrame + 1}`];
        if (frameTexture && characters.webWoman) {
            characters.webWoman.texture = frameTexture;
        }
    }

    // Coffee cup animation
    animState.cupFrameTimer += 1;
    if (animState.cupFrameTimer > 15) {
        animState.cupFrameTimer = 0;
        animState.cupFrame = (animState.cupFrame + 1) % 5;
        const cupTexture = texturesRef.current[`cup${animState.cupFrame + 1}`];
        if (cupTexture && assetsRef.current.coffeeCup) {
            assetsRef.current.coffeeCup.texture = cupTexture;
        }
    }

    // Update positions
    if (assetsRef.current.table && assetsRef.current.monitor && assetsRef.current.coffeeCup) {
        const table = assetsRef.current.table;
        table.x = window.innerWidth / 2 + 270;
        table.y = window.innerHeight - table.height / 2 - 50;

        assetsRef.current.monitor.x = table.x;
        assetsRef.current.monitor.y = table.y - 0;

        assetsRef.current.coffeeCup.x = table.x + 60;
        assetsRef.current.coffeeCup.y = table.y - 0;

        if (characters.snoringMan) {
            characters.snoringMan.anchor.set(0.5, 0.5);
            characters.snoringMan.x = table.x - 30;
            characters.snoringMan.y = table.y + 72;
        }
        if (characters.webWoman) {
            characters.webWoman.anchor.set(0.5, 0.5);
            characters.webWoman.x = table.x + 25;
            characters.webWoman.y = table.y + 0;
        }
    }

    // Update background
    if (assetsRef.current.officeBg) {
        assetsRef.current.officeBg.width = window.innerWidth;
        assetsRef.current.officeBg.height = window.innerHeight;
    }
};

export const repositionDownloadScene = (refs: SceneRefs) => {
    const { assetsRef } = refs;
    if (assetsRef.current.officeBg) {
        assetsRef.current.officeBg.width = window.innerWidth;
        assetsRef.current.officeBg.height = window.innerHeight;
    }
    if (assetsRef.current.table && assetsRef.current.monitor && assetsRef.current.characters) {
        const table = assetsRef.current.table;
        table.x = window.innerWidth / 2 + 270;
        table.y = window.innerHeight - table.height / 2 - 50;

        assetsRef.current.monitor.x = table.x;
        assetsRef.current.monitor.y = table.y - 0;

        assetsRef.current.coffeeCup.x = table.x + 60;
        assetsRef.current.coffeeCup.y = table.y - 0;

        const { characters } = assetsRef.current;
        if (characters.snoringMan) {
            characters.snoringMan.anchor.set(0.5, 0.5);
            characters.snoringMan.x = table.x - 30;
            characters.snoringMan.y = table.y + 72;
        }
        if (characters.webWoman) {
            characters.webWoman.anchor.set(0.5, 0.5);
            characters.webWoman.x = table.x + 25;
            characters.webWoman.y = table.y + 0;
        }
    }
};
