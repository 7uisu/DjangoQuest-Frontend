import * as PIXI from 'pixi.js';

// Extend Sprite to include userData for cloud animations
interface CloudSprite extends PIXI.Sprite {
    userData: {
        speed: number;
        direction: number;
    };
}

interface SceneRefs {
    texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>;
    assetsRef: React.MutableRefObject<{ [key: string]: any }>;
    scenesRef: React.MutableRefObject<{ [key: string]: PIXI.Container }>;
}

const createCloud = (scene: PIXI.Container, cloudType: number, texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>): CloudSprite => {
    let texture;
    switch (cloudType % 3) {
        case 0: texture = texturesRef.current.cloud1; break;
        case 1: texture = texturesRef.current.cloud2; break;
        default: texture = texturesRef.current.cloud3; break;
    }

    const cloud = new PIXI.Sprite(texture) as CloudSprite;
    const scale = Math.random() * 0.3 + 0.2;
    cloud.scale.set(scale);

    if (Math.random() > 0.5) {
        cloud.scale.x *= -1;
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    if (direction > 0) {
        cloud.x = -cloud.width;
    } else {
        cloud.x = window.innerWidth + cloud.width;
    }
    cloud.y = Math.random() * (window.innerHeight / 2);

    cloud.userData = {
        speed: (Math.random() * 0.5) + 0.2,
        direction: direction
    };

    scene.addChild(cloud);
    return cloud;
};

export const initAboutScene = (scene: PIXI.Container, refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;

    // Background image
    const background = new PIXI.Sprite(texturesRef.current.aboutBg);
    background.width = window.innerWidth;
    background.height = window.innerHeight;
    scene.addChild(background);
    assetsRef.current.aboutBg = background;

    // Cloud container
    const clouds = new PIXI.Container();
    for (let i = 0; i < 30; i++) {
        createCloud(clouds, i, texturesRef);
    }
    scene.addChild(clouds);
    assetsRef.current.clouds = clouds;
};

export const updateAboutScene = (refs: SceneRefs) => {
    const { assetsRef, scenesRef } = refs;
    if (!scenesRef.current.about?.visible || !assetsRef.current.clouds) return;

    assetsRef.current.clouds.children.forEach((child: any) => {
        const cloud = child as CloudSprite;
        if (cloud.userData && cloud.userData.speed) {
            cloud.x += cloud.userData.direction === 1 ? cloud.userData.speed : -cloud.userData.speed;
            if (cloud.x < -cloud.width) {
                cloud.x = window.innerWidth;
            } else if (cloud.x > window.innerWidth) {
                cloud.x = -cloud.width;
            }
        }
    });
};

export const repositionAboutScene = (refs: SceneRefs) => {
    const { assetsRef } = refs;
    if (assetsRef.current.aboutBg) {
        assetsRef.current.aboutBg.width = window.innerWidth;
        assetsRef.current.aboutBg.height = window.innerHeight;
    }
};
