import * as PIXI from 'pixi.js';

// Extend Graphics to include userData for animations
interface ExtendedGraphics extends PIXI.Graphics {
    userData?: {
        blinkRate?: number;
        blinkDir?: number;
        speed?: number;
    };
}

interface Comet extends PIXI.Graphics {
    userData: {
        speed: number;
        tailLength: number;
        angle: number;
    };
}

interface SceneRefs {
    texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>;
    assetsRef: React.MutableRefObject<{ [key: string]: any }>;
    scenesRef: React.MutableRefObject<{ [key: string]: PIXI.Container }>;
}

const drawComet = (comet: Comet) => {
    comet.clear();
    comet.beginFill(0xFFFFFF);
    comet.drawRect(0, 0, 3, 3);
    comet.endFill();

    const tailLength = comet.userData.tailLength;
    const tailAngle = comet.userData.angle + Math.PI;

    for (let i = 0; i < tailLength; i += 2) {
        const alpha = 1 - (i / tailLength);
        const width = Math.max(1, 3 - (i / tailLength) * 3);
        const xOffset = Math.cos(tailAngle) * i;
        const yOffset = Math.sin(tailAngle) * i;
        comet.beginFill(0xCCFFFF, alpha);
        comet.drawRect(xOffset, yOffset, width, width);
        comet.endFill();
    }
};

const createComet = (scene: PIXI.Container) => {
    const comet = new PIXI.Graphics() as Comet;
    const speed = Math.random() * 2 + 1;
    const tailLength = Math.random() * 30 + 20;
    const angle = Math.random() * Math.PI * 2;

    comet.userData = { speed, tailLength, angle };

    const edgeOffset = 100;
    const screenEdge = Math.floor(Math.random() * 4);

    switch (screenEdge) {
        case 0:
            comet.x = Math.random() * window.innerWidth;
            comet.y = -edgeOffset;
            break;
        case 1:
            comet.x = window.innerWidth + edgeOffset;
            comet.y = Math.random() * window.innerHeight;
            break;
        case 2:
            comet.x = Math.random() * window.innerWidth;
            comet.y = window.innerHeight + edgeOffset;
            break;
        case 3:
            comet.x = -edgeOffset;
            comet.y = Math.random() * window.innerHeight;
            break;
    }

    drawComet(comet);
    scene.addChild(comet);
    return comet;
};

export const initHomeScene = (scene: PIXI.Container, refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;

    // Starfield
    for (let i = 0; i < 150; i++) {
        const star = new PIXI.Graphics() as ExtendedGraphics;
        star.beginFill(0xFFFFFF);
        const size = Math.random() * 2 + 1;
        star.drawRect(0, 0, size, size);
        star.endFill();
        star.x = Math.floor(Math.random() * window.innerWidth);
        star.y = Math.floor(Math.random() * window.innerHeight);
        star.alpha = Math.random() * 0.5 + 0.5;
        star.userData = {
            blinkRate: Math.random() * 0.02 + 0.005,
            blinkDir: Math.random() > 0.5 ? 1 : -1
        };
        scene.addChild(star);
    }

    // Comets container
    const cometsContainer = new PIXI.Container();
    scene.addChild(cometsContainer);
    assetsRef.current.cometsContainer = cometsContainer;

    for (let i = 0; i < 5; i++) {
        createComet(cometsContainer);
    }

    // Moon
    const moonSprite = new PIXI.Sprite(texturesRef.current.moon);
    moonSprite.anchor.set(0.5, 0.5);
    moonSprite.width = window.innerWidth * 0.10;
    const moonAR = texturesRef.current.moon.width / texturesRef.current.moon.height;
    moonSprite.height = moonSprite.width / moonAR;
    moonSprite.x = window.innerWidth * 0.2;
    moonSprite.y = window.innerHeight * 0.2;
    moonSprite.userData = { rotationSpeed: 2 * Math.PI / 60 };
    scene.addChild(moonSprite);

    // Saturn
    const saturnSprite = new PIXI.Sprite(texturesRef.current.saturn);
    saturnSprite.anchor.set(0.5, 0.5);
    saturnSprite.width = window.innerWidth * 0.15;
    const saturnAR = texturesRef.current.saturn.width / texturesRef.current.saturn.height;
    saturnSprite.height = saturnSprite.width / saturnAR;
    saturnSprite.x = window.innerWidth * 0.8;
    saturnSprite.y = window.innerHeight * 0.3;
    saturnSprite.userData = { rotationSpeed: 2 * Math.PI / 120 };
    scene.addChild(saturnSprite);

    // Half Earth
    const halfEarthSprite = new PIXI.Sprite(texturesRef.current.halfEarth);
    halfEarthSprite.anchor.set(0.5, 0.5);
    halfEarthSprite.width = window.innerWidth;
    const earthAR = texturesRef.current.halfEarth.width / texturesRef.current.halfEarth.height;
    halfEarthSprite.height = halfEarthSprite.width / earthAR;
    halfEarthSprite.x = window.innerWidth / 2;
    halfEarthSprite.y = window.innerHeight - halfEarthSprite.height / 2;
    scene.addChild(halfEarthSprite);

    // Rocket
    const rocketSprite = new PIXI.Sprite(texturesRef.current.rocket);
    rocketSprite.anchor.set(0.5, 0.5);
    rocketSprite.width = 250;
    const rocketAR = texturesRef.current.rocket.width / texturesRef.current.rocket.height;
    rocketSprite.height = rocketSprite.width / rocketAR;
    rocketSprite.x = 400;
    rocketSprite.y = window.innerHeight / 2;
    rocketSprite.rotation = -20 * (Math.PI / 180);
    rocketSprite.userData = { hoverTime: 0, baseY: rocketSprite.y };
    scene.addChild(rocketSprite);

    assetsRef.current.homeElements = {
        halfEarth: halfEarthSprite,
        saturn: saturnSprite,
        moon: moonSprite,
        rocket: rocketSprite
    };
};

export const updateHomeScene = (refs: SceneRefs) => {
    const { assetsRef, scenesRef } = refs;
    if (!scenesRef.current.home?.visible) return;

    // Animate stars
    scenesRef.current.home.children.forEach(child => {
        if (child instanceof PIXI.Graphics && child.userData && child.userData.blinkRate) {
            const star = child as ExtendedGraphics;
            star.alpha += star.userData.blinkRate * star.userData.blinkDir;
            if (star.alpha > 1) { star.alpha = 1; star.userData.blinkDir = -1; }
            else if (star.alpha < 0.3) { star.alpha = 0.3; star.userData.blinkDir = 1; }
        }
    });

    // Animate comets
    if (assetsRef.current.cometsContainer) {
        assetsRef.current.cometsContainer.children.forEach((child: any) => {
            if (child instanceof PIXI.Graphics && child.userData && child.userData.speed !== undefined) {
                const comet = child as Comet;
                comet.x += Math.cos(comet.userData.angle) * comet.userData.speed;
                comet.y += Math.sin(comet.userData.angle) * comet.userData.speed;
                drawComet(comet);
                const padding = 200;
                if (comet.x < -padding || comet.x > window.innerWidth + padding ||
                    comet.y < -padding || comet.y > window.innerHeight + padding) {
                    assetsRef.current.cometsContainer.removeChild(comet);
                    createComet(assetsRef.current.cometsContainer);
                }
            }
        });
    }

    // Animate planets and rocket
    if (assetsRef.current.homeElements) {
        const { saturn, moon, rocket } = assetsRef.current.homeElements;
        if (saturn.userData?.rotationSpeed) saturn.rotation += saturn.userData.rotationSpeed / 60;
        if (moon.userData?.rotationSpeed) moon.rotation += moon.userData.rotationSpeed / 60;
        if (rocket.userData) {
            rocket.userData.hoverTime += 0.033;
            const hoverOffset = Math.sin(rocket.userData.hoverTime * Math.PI / 2) * 20;
            rocket.y = rocket.userData.baseY + hoverOffset;
            rocket.rotation = (-20 + (hoverOffset / 20) * 5) * (Math.PI / 180);
        }
    }
};

export const repositionHomeScene = (refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;
    if (!assetsRef.current.homeElements) return;

    const { halfEarth, saturn, moon, rocket } = assetsRef.current.homeElements;
    halfEarth.width = window.innerWidth;
    const earthAR = texturesRef.current.halfEarth.width / texturesRef.current.halfEarth.height;
    halfEarth.height = halfEarth.width / earthAR;
    halfEarth.x = window.innerWidth / 2;
    halfEarth.y = window.innerHeight - halfEarth.height / 2;

    saturn.width = window.innerWidth * 0.15;
    const saturnAR = texturesRef.current.saturn.width / texturesRef.current.saturn.height;
    saturn.height = saturn.width / saturnAR;
    saturn.x = window.innerWidth * 0.8;
    saturn.y = window.innerHeight * 0.3;

    moon.width = window.innerWidth * 0.10;
    const moonAR = texturesRef.current.moon.width / texturesRef.current.moon.height;
    moon.height = moon.width / moonAR;
    moon.x = window.innerWidth * 0.2;
    moon.y = window.innerHeight * 0.2;

    rocket.width = 250;
    const rocketAR = texturesRef.current.rocket.width / texturesRef.current.rocket.height;
    rocket.height = rocket.width / rocketAR;
    rocket.x = 400;
    rocket.userData.baseY = window.innerHeight / 2;
    rocket.y = rocket.userData.baseY + Math.sin(rocket.userData.hoverTime * Math.PI / 2) * 20;
};
