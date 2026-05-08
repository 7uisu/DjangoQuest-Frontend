import * as PIXI from 'pixi.js';

interface SceneRefs {
    texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>;
    assetsRef: React.MutableRefObject<{ [key: string]: any }>;
    scenesRef: React.MutableRefObject<{ [key: string]: PIXI.Container }>;
}

const getResponsiveLayout = () => {
    // Determine scale based on window size so it fits the background proportionally
    const scaleFactor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    // Lowered the max scale significantly to prevent it from out-sizing the background
    const baseScale = Math.max(0.4, 1.2 * scaleFactor);
    
    const isMobile = window.innerWidth < 768;
    const centerX = window.innerWidth / 2;
    const yOffset = isMobile ? 120 : 50;
    
    return { baseScale, centerX, yOffset };
};

export const initDownloadScene = (scene: PIXI.Container, refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;
    const { baseScale, centerX, yOffset } = getResponsiveLayout();

    // Office background
    const officeBg = new PIXI.Sprite(texturesRef.current.officeBg);
    officeBg.width = window.innerWidth;
    officeBg.height = window.innerHeight;
    scene.addChild(officeBg);
    assetsRef.current.officeBg = officeBg;

    // Table
    const table = new PIXI.Sprite(texturesRef.current.table);
    table.anchor.set(0.5, 0.5);
    table.scale.set(baseScale);
    table.x = centerX;
    table.y = window.innerHeight - table.height / 2 - yOffset;
    scene.addChild(table);
    assetsRef.current.table = table;

    // Monitor
    const monitor = new PIXI.Sprite(texturesRef.current.monitor);
    monitor.anchor.set(0.5, 0.5);
    monitor.scale.set(baseScale);
    monitor.x = table.x;
    monitor.y = table.y;
    scene.addChild(monitor);
    assetsRef.current.monitor = monitor;

    // Coffee cup
    const coffeeCup = new PIXI.Sprite(texturesRef.current.cup1);
    coffeeCup.anchor.set(0.5, 0.5);
    coffeeCup.scale.set(baseScale);
    coffeeCup.x = table.x + (60 * (baseScale / 1.5));
    coffeeCup.y = table.y;
    scene.addChild(coffeeCup);
    assetsRef.current.coffeeCup = coffeeCup;

    // Characters container
    const charactersContainer = new PIXI.Container();
    scene.addChild(charactersContainer);

    // Sleeping man
    const snoringMan = new PIXI.Sprite(texturesRef.current.snoring1);
    snoringMan.anchor.set(0.5, 0.5);
    snoringMan.scale.set(baseScale);
    snoringMan.x = table.x - (30 * (baseScale / 1.5));
    snoringMan.y = table.y + (72 * (baseScale / 1.5));
    charactersContainer.addChild(snoringMan);

    // Web woman
    const webWoman = new PIXI.Sprite(texturesRef.current.webwoman1);
    webWoman.anchor.set(0.5, 0.5);
    webWoman.scale.set(baseScale);
    webWoman.x = table.x + (25 * (baseScale / 1.5));
    webWoman.y = table.y;
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
        const { baseScale, centerX, yOffset } = getResponsiveLayout();
        const table = assetsRef.current.table;
        
        table.scale.set(baseScale);
        table.x = centerX;
        table.y = window.innerHeight - table.height / 2 - yOffset;

        assetsRef.current.monitor.scale.set(baseScale);
        assetsRef.current.monitor.x = table.x;
        assetsRef.current.monitor.y = table.y;

        assetsRef.current.coffeeCup.scale.set(baseScale);
        assetsRef.current.coffeeCup.x = table.x + (60 * (baseScale / 1.5));
        assetsRef.current.coffeeCup.y = table.y;

        if (characters.snoringMan) {
            characters.snoringMan.scale.set(baseScale);
            characters.snoringMan.anchor.set(0.5, 0.5);
            characters.snoringMan.x = table.x - (30 * (baseScale / 1.5));
            characters.snoringMan.y = table.y + (72 * (baseScale / 1.5));
        }
        if (characters.webWoman) {
            characters.webWoman.scale.set(baseScale);
            characters.webWoman.anchor.set(0.5, 0.5);
            characters.webWoman.x = table.x + (25 * (baseScale / 1.5));
            characters.webWoman.y = table.y;
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
        const { baseScale, centerX, yOffset } = getResponsiveLayout();
        const table = assetsRef.current.table;

        table.scale.set(baseScale);
        table.x = centerX;
        table.y = window.innerHeight - table.height / 2 - yOffset;

        assetsRef.current.monitor.scale.set(baseScale);
        assetsRef.current.monitor.x = table.x;
        assetsRef.current.monitor.y = table.y;

        assetsRef.current.coffeeCup.scale.set(baseScale);
        assetsRef.current.coffeeCup.x = table.x + (60 * (baseScale / 1.5));
        assetsRef.current.coffeeCup.y = table.y;

        const { characters } = assetsRef.current;
        if (characters.snoringMan) {
            characters.snoringMan.scale.set(baseScale);
            characters.snoringMan.anchor.set(0.5, 0.5);
            characters.snoringMan.x = table.x - (30 * (baseScale / 1.5));
            characters.snoringMan.y = table.y + (72 * (baseScale / 1.5));
        }
        if (characters.webWoman) {
            characters.webWoman.scale.set(baseScale);
            characters.webWoman.anchor.set(0.5, 0.5);
            characters.webWoman.x = table.x + (25 * (baseScale / 1.5));
            characters.webWoman.y = table.y;
        }
    }
};
