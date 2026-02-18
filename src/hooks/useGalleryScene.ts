import * as PIXI from 'pixi.js';

interface ExtendedGraphics extends PIXI.Graphics {
    userData?: {
        blinkRate?: number;
        blinkDir?: number;
        speed?: number;
    };
}

interface SceneRefs {
    texturesRef: React.MutableRefObject<{ [key: string]: PIXI.Texture }>;
    assetsRef: React.MutableRefObject<{ [key: string]: any }>;
    scenesRef: React.MutableRefObject<{ [key: string]: PIXI.Container }>;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const initGalleryScene = (scene: PIXI.Container, refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;

    const skyBg = new PIXI.Graphics();
    skyBg.beginFill(0x000022);
    skyBg.drawRect(0, 0, window.innerWidth, window.innerHeight * 0.6);
    skyBg.endFill();

    const sunsetGradient = new PIXI.Graphics();
    const gradientHeight = window.innerHeight * 0.4;
    for (let i = 0; i < gradientHeight; i++) {
        const ratio = i / gradientHeight;
        let color;
        if (ratio < 0.3) {
            const r = Math.floor(lerp(0, 100, ratio / 0.3));
            const g = Math.floor(lerp(0, 30, ratio / 0.3));
            const b = Math.floor(lerp(34, 80, ratio / 0.3));
            color = (r << 16) | (g << 8) | b;
        } else if (ratio < 0.6) {
            const adjRatio = (ratio - 0.3) / 0.3;
            const r = Math.floor(lerp(100, 255, adjRatio));
            const g = Math.floor(lerp(30, 140, adjRatio));
            const b = Math.floor(lerp(80, 40, adjRatio));
            color = (r << 16) | (g << 8) | b;
        } else {
            const adjRatio = (ratio - 0.6) / 0.4;
            const r = Math.floor(lerp(255, 100, adjRatio));
            const g = Math.floor(lerp(140, 140, adjRatio));
            const b = Math.floor(lerp(40, 200, adjRatio));
            color = (r << 16) | (g << 8) | b;
        }
        sunsetGradient.beginFill(color);
        sunsetGradient.drawRect(0, window.innerHeight * 0.6 + i, window.innerWidth, 1);
        sunsetGradient.endFill();
    }

    scene.addChild(skyBg);
    scene.addChild(sunsetGradient);

    // Stars
    const stars = new PIXI.Container();
    for (let i = 0; i < 100; i++) {
        const star = new PIXI.Graphics() as ExtendedGraphics;
        star.beginFill(0xFFFFFF);
        const size = Math.random() * 2 + 1;
        star.drawRect(0, 0, size, size);
        star.endFill();
        star.x = Math.floor(Math.random() * window.innerWidth);
        star.y = Math.floor(Math.random() * (window.innerHeight * 0.6));
        star.alpha = Math.random() * 0.5 + 0.5;
        star.userData = {
            blinkRate: Math.random() * 0.02 + 0.005,
            blinkDir: Math.random() > 0.5 ? 1 : -1
        };
        stars.addChild(star);
    }
    scene.addChild(stars);

    // City container
    const cityContainer = new PIXI.Container();
    const pathSprite = new PIXI.Sprite(texturesRef.current.path);
    pathSprite.width = window.innerWidth;
    const aspectRatio = texturesRef.current.path.width / texturesRef.current.path.height;
    pathSprite.height = pathSprite.width / aspectRatio;
    pathSprite.x = 0;
    pathSprite.y = window.innerHeight - pathSprite.height;
    cityContainer.addChild(pathSprite);

    const buildingWidth = pathSprite.width;

    const pizzaSprite = new PIXI.Sprite(texturesRef.current.pizza);
    pizzaSprite.anchor.set(0.5, 0.5);
    pizzaSprite.width = buildingWidth;
    const pizzaAR = texturesRef.current.pizza.width / texturesRef.current.pizza.height;
    pizzaSprite.height = pizzaSprite.width / pizzaAR;
    pizzaSprite.x = buildingWidth / 2;
    pizzaSprite.y = pathSprite.y + pizzaSprite.height / 2;
    cityContainer.addChild(pizzaSprite);

    const officeSprite = new PIXI.Sprite(texturesRef.current.office);
    officeSprite.anchor.set(0.5, 0.5);
    officeSprite.width = buildingWidth;
    const officeAR = texturesRef.current.office.width / texturesRef.current.office.height;
    officeSprite.height = officeSprite.width / officeAR;
    officeSprite.x = buildingWidth / 2;
    officeSprite.y = pathSprite.y + officeSprite.height / 2;
    cityContainer.addChild(officeSprite);

    const bankSprite = new PIXI.Sprite(texturesRef.current.bank);
    bankSprite.anchor.set(0.5, 0.5);
    bankSprite.width = buildingWidth;
    const bankAR = texturesRef.current.bank.width / texturesRef.current.bank.height;
    bankSprite.height = bankSprite.width / bankAR;
    bankSprite.x = buildingWidth / 2;
    bankSprite.y = pathSprite.y + bankSprite.height / 2 + 3;
    cityContainer.addChild(bankSprite);

    scene.addChild(cityContainer);

    // Vehicles
    const vehiclesContainer = new PIXI.Container();
    const numVehicles = 8;
    const vehicles: any[] = [];

    for (let i = 0; i < numVehicles; i++) {
        const isCarTexture = i % 2 === 0;
        const vehicle = new PIXI.Sprite(isCarTexture ? texturesRef.current.car : texturesRef.current.taxi);
        vehicle.anchor.set(0.5, 0.5);

        const targetHeight = pathSprite.height * 0.7;
        const vehicleAR = vehicle.width / vehicle.height;
        vehicle.height = targetHeight;
        vehicle.width = targetHeight * vehicleAR;

        if (i < 3) {
            vehicle.x = (window.innerWidth / 4) * i;
        } else {
            vehicle.x = -vehicle.width - ((i - 3) * (window.innerWidth / numVehicles));
        }
        vehicle.y = pathSprite.y + pathSprite.height * 0.95;

        vehicles.push({
            sprite: vehicle,
            speed: Math.random() * 1 + 2.5,
            baseY: vehicle.y,
            shakeOffset: 0,
            shakeTime: Math.random() * Math.PI * 2
        });
        vehiclesContainer.addChild(vehicle);
    }

    // Avoid initial overlaps
    for (let i = 0; i < vehicles.length; i++) {
        for (let j = 0; j < i; j++) {
            const minSafeDistance = (vehicles[i].sprite.width + vehicles[j].sprite.width) * 0.7;
            const distance = Math.abs(vehicles[i].sprite.x - vehicles[j].sprite.x);
            if (distance < minSafeDistance) {
                vehicles[i].sprite.x -= minSafeDistance;
            }
        }
    }

    scene.addChild(vehiclesContainer);

    assetsRef.current.galleryElements = {
        skyBg, sunsetGradient, stars, path: pathSprite,
        buildings: { bank: bankSprite, office: officeSprite, pizza: pizzaSprite },
        vehicles
    };
};

export const updateGalleryScene = (refs: SceneRefs) => {
    const { assetsRef, scenesRef } = refs;
    if (!scenesRef.current.gallery?.visible || !assetsRef.current.galleryElements) return;
    const ge = assetsRef.current.galleryElements;

    // Twinkle stars
    if (ge.stars) {
        ge.stars.children.forEach((child: any) => {
            const star = child as ExtendedGraphics;
            if (star.userData?.blinkRate) {
                star.alpha += star.userData.blinkRate * star.userData.blinkDir;
                if (star.alpha > 1) { star.alpha = 1; star.userData.blinkDir = -1; }
                else if (star.alpha < 0.3) { star.alpha = 0.3; star.userData.blinkDir = 1; }
            }
        });
    }

    // Animate vehicles
    if (ge.vehicles) {
        ge.vehicles.forEach((vehicle: any) => {
            vehicle.sprite.x += vehicle.speed;
            vehicle.shakeTime += 0.3;
            const vibration = Math.random() * 0.5;
            const bumpFactor = Math.sin(vehicle.shakeTime * 0.3) > 0.8 ? 1 : 0;
            const bump = bumpFactor * (Math.random() * 1.2);
            vehicle.shakeOffset = vibration + bump;
            vehicle.sprite.y = vehicle.baseY + vehicle.shakeOffset;
            vehicle.sprite.rotation = vehicle.shakeOffset * 0.01;
        });

        // Spawn check
        const visibleVehicles = ge.vehicles.filter((v: any) =>
            v.sprite.x > -v.sprite.width && v.sprite.x < window.innerWidth + v.sprite.width
        );

        if (visibleVehicles.length === 0 && !ge.vehicles.some((v: any) => v.sprite.x > -v.sprite.width * 2 && v.sprite.x < 0)) {
            let furthestVehicle = ge.vehicles[0];
            for (let i = 1; i < ge.vehicles.length; i++) {
                if (ge.vehicles[i].sprite.x > furthestVehicle.sprite.x) {
                    furthestVehicle = ge.vehicles[i];
                }
            }
            furthestVehicle.sprite.x = -furthestVehicle.sprite.width;
            furthestVehicle.speed = Math.random() * 1 + 3;
        }

        // Respawn off-screen vehicles
        for (let i = 0; i < ge.vehicles.length; i++) {
            const vehicle = ge.vehicles[i];
            if (vehicle.sprite.x > window.innerWidth + vehicle.sprite.width) {
                vehicle.sprite.x = -vehicle.sprite.width * 1.2;

                let hasCollision = true;
                let attempts = 0;
                while (hasCollision && attempts < 10) {
                    hasCollision = false;
                    attempts++;
                    for (let j = 0; j < ge.vehicles.length; j++) {
                        if (i === j) continue;
                        const other = ge.vehicles[j];
                        const minDist = (vehicle.sprite.width + other.sprite.width) * 0.7;
                        if (Math.abs(vehicle.sprite.x - other.sprite.x) < minDist) {
                            hasCollision = true;
                            vehicle.sprite.x -= minDist;
                            break;
                        }
                    }
                }
                vehicle.speed = Math.random() * 1 + 2.5;
            }
        }
    }
};

export const repositionGalleryScene = (refs: SceneRefs) => {
    const { texturesRef, assetsRef } = refs;
    if (!assetsRef.current.galleryElements) return;

    const ge = assetsRef.current.galleryElements;
    const pathSprite = ge.path;
    if (!pathSprite) return;

    pathSprite.width = window.innerWidth;
    const ar = texturesRef.current.path.width / texturesRef.current.path.height;
    pathSprite.height = pathSprite.width / ar;
    pathSprite.x = 0;
    pathSprite.y = window.innerHeight - pathSprite.height;

    // Sky background
    ge.skyBg.clear();
    ge.skyBg.beginFill(0x000022);
    ge.skyBg.drawRect(0, 0, window.innerWidth, window.innerHeight * 0.6);
    ge.skyBg.endFill();

    // Sunset gradient
    ge.sunsetGradient.clear();
    const gradientHeight = window.innerHeight * 0.4;
    for (let i = 0; i < gradientHeight; i++) {
        const ratio = i / gradientHeight;
        let color;
        if (ratio < 0.3) {
            const r = Math.floor(lerp(0, 100, ratio / 0.3));
            const g = Math.floor(lerp(0, 30, ratio / 0.3));
            const b = Math.floor(lerp(34, 80, ratio / 0.3));
            color = (r << 16) | (g << 8) | b;
        } else if (ratio < 0.6) {
            const adjRatio = (ratio - 0.3) / 0.3;
            const r = Math.floor(lerp(100, 255, adjRatio));
            const g = Math.floor(lerp(30, 140, adjRatio));
            const b = Math.floor(lerp(80, 40, adjRatio));
            color = (r << 16) | (g << 8) | b;
        } else {
            const adjRatio = (ratio - 0.6) / 0.4;
            const r = Math.floor(lerp(255, 100, adjRatio));
            const g = Math.floor(lerp(140, 140, adjRatio));
            const b = Math.floor(lerp(40, 200, adjRatio));
            color = (r << 16) | (g << 8) | b;
        }
        ge.sunsetGradient.beginFill(color);
        ge.sunsetGradient.drawRect(0, window.innerHeight * 0.6 + i, window.innerWidth, 1);
        ge.sunsetGradient.endFill();
    }

    // Buildings
    const bw = pathSprite.width;
    const { buildings } = ge;
    if (buildings.pizza) {
        buildings.pizza.width = bw;
        const pizzaAR = texturesRef.current.pizza.width / texturesRef.current.pizza.height;
        buildings.pizza.height = buildings.pizza.width / pizzaAR;
        buildings.pizza.x = bw / 2;
        buildings.pizza.y = pathSprite.y + buildings.pizza.height / 2;
    }
    if (buildings.office) {
        buildings.office.width = bw;
        const officeAR = texturesRef.current.office.width / texturesRef.current.office.height;
        buildings.office.height = buildings.office.width / officeAR;
        buildings.office.x = bw / 2;
        buildings.office.y = pathSprite.y + buildings.office.height / 2;
    }
    if (buildings.bank) {
        buildings.bank.width = bw;
        const bankAR = texturesRef.current.bank.width / texturesRef.current.bank.height;
        buildings.bank.height = buildings.bank.width / bankAR;
        buildings.bank.x = bw / 2;
        buildings.bank.y = pathSprite.y + buildings.bank.height / 2 + 3;
    }

    // Vehicles
    if (ge.vehicles) {
        ge.vehicles.forEach((vehicle: any) => {
            const targetHeight = pathSprite.height * 0.7;
            const vehicleAR = vehicle.sprite.width / vehicle.sprite.height;
            vehicle.sprite.height = targetHeight;
            vehicle.sprite.width = targetHeight * vehicleAR;
            vehicle.baseY = pathSprite.y + pathSprite.height * 0.95;
            vehicle.sprite.y = vehicle.baseY + vehicle.shakeOffset;
        });
    }
};
