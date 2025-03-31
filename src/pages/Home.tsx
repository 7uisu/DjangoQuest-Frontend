import "../styles/Home.css";
import Navbar from '../components/Navbar';
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

// Extend Graphics to include userData for animations
interface ExtendedGraphics extends PIXI.Graphics {
  userData?: {
    blinkRate?: number;
    blinkDir?: number;
    speed?: number;
  };
}

// Extend Sprite to include userData for cloud animations
interface CloudSprite extends PIXI.Sprite {
  userData: {
    speed: number;
    direction: number; // 1 for right, -1 for left
  };
}

interface HomeProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const Home = ({ currentSection, setCurrentSection }: HomeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing DjangoQuest...");
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const scenesRef = useRef<{[key: string]: PIXI.Container}>({});
  const assetsRef = useRef<{[key: string]: any}>({});
  const animationFrameRef = useRef<number | null>(null);
  const texturesRef = useRef<{[key: string]: PIXI.Texture}>({});

  // Simulate loading process
  useEffect(() => {
    const loadingSteps = [
      //{ progress: 10, text: "Loading space elements..." },
      //{ progress: 25, text: "Generating pixel worlds..." },
      //{ progress: 40, text: "Brewing Django magic..." },
      //{ progress: 60, text: "Calibrating comets..." },
      //{ progress: 75, text: "Preparing your adventure..." },
      //{ progress: 90, text: "Almost ready..." },
      { progress: 100, text: "Welcome to DjangoQuest!" }
    ];
    
    let step = 0;
    
    const loadingInterval = setInterval(() => {
      if (step < loadingSteps.length) {
        setLoadingProgress(loadingSteps[step].progress);
        setLoadingText(loadingSteps[step].text);
        step++;
      } else {
        clearInterval(loadingInterval);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Delay after reaching 100%
      }
    }, 700); // Time between loading steps
    
    return () => clearInterval(loadingInterval);
  }, []);

  // Function to initialize PixiJS
  useEffect(() => {
    document.title = "DjangoQuest - Learn Django the Fun Way";

    // Only initialize PixiJS after loading is complete
    if (!pixiContainerRef.current || isLoading) return;

    // Create PixiJS Application with pixelated rendering
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000022, // Dark space blue
      antialias: false, // Disable antialiasing for pixelated look
      resolution: 1,
    });
    
    // Set pixel scaling mode for crisp pixelated graphics
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    
    // Load textures for clouds and background
    texturesRef.current = {
      halfEarth: PIXI.Texture.from('/images/Halfearth.png'),
      saturn: PIXI.Texture.from('/images/PLANET2_MAZE.png'),
      moon: PIXI.Texture.from('/images/PLANET6.png'),
      rocket: PIXI.Texture.from('/images/Rocket.png'),
      // About Section Images
      cloud1: PIXI.Texture.from('/images/cloud1.png'),
      cloud2: PIXI.Texture.from('/images/cloud2.png'),
      cloud3: PIXI.Texture.from('/images/cloud3.png'),
      aboutBg: PIXI.Texture.from('/images/Section_About_BG.png'),
      // Gallery Section Images
      path: PIXI.Texture.from('/images/Screenshot_Section/path.png'),
      bank: PIXI.Texture.from('/images/Screenshot_Section/bank.png'),
      office: PIXI.Texture.from('/images/Screenshot_Section/office.png'),
      pizza: PIXI.Texture.from('/images/Screenshot_Section/pizza.png'),
      taxi: PIXI.Texture.from('/images/Screenshot_Section/taxi.png'),
      car: PIXI.Texture.from('/images/Screenshot_Section/car.png'),
      // Download Section Images
        officeBg: PIXI.Texture.from('/images/Download_Section/office_bg.png'),
        table: PIXI.Texture.from('/images/Download_Section/table.png'),
        monitor: PIXI.Texture.from('/images/Download_Section/monitor.png'),
        // Snoring man animation frames
        snoring1: PIXI.Texture.from('/images/Download_Section/snoring1.png'),
        snoring2: PIXI.Texture.from('/images/Download_Section/snoring2.png'),
        snoring3: PIXI.Texture.from('/images/Download_Section/snoring3.png'),
        snoring4: PIXI.Texture.from('/images/Download_Section/snoring4.png'),
        snoring5: PIXI.Texture.from('/images/Download_Section/snoring5.png'),
        // Web woman animation frames
        webwoman1: PIXI.Texture.from('/images/Download_Section/webwoman.png'),
        webwoman2: PIXI.Texture.from('/images/Download_Section/webwoman2.png'),
        // Cup animation frames
        cup1: PIXI.Texture.from('/images/Download_Section/cup1.png'),
        cup2: PIXI.Texture.from('/images/Download_Section/cup2.png'),
        cup3: PIXI.Texture.from('/images/Download_Section/cup3.png'),
        cup4: PIXI.Texture.from('/images/Download_Section/cup4.png'),
        cup5: PIXI.Texture.from('/images/Download_Section/cup5.png')
      
    };
    
    // Append canvas to container
    pixiContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create separate containers for each section
    const homeScene = new PIXI.Container();
    const aboutScene = new PIXI.Container();
    const galleryScene = new PIXI.Container();
    const downloadScene = new PIXI.Container();

    // Store scenes for later reference
    scenesRef.current = {
      home: homeScene,
      about: aboutScene,
      gallery: galleryScene,
      download: downloadScene
    };

    // Add scenes to stage but hide all except home initially
    app.stage.addChild(homeScene);
    app.stage.addChild(aboutScene);
    app.stage.addChild(galleryScene);
    app.stage.addChild(downloadScene);
    
    aboutScene.visible = false;
    galleryScene.visible = false;
    downloadScene.visible = false;

    // Initialize scenes
    initHomeScene(homeScene);
    initAboutScene(aboutScene);
    initGalleryScene(galleryScene);
    initDownloadScene(downloadScene);

    // Handle window resize
    const handleResize = () => {
      if (!appRef.current) return;
      appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      
      // Reposition elements in each scene based on new dimensions
      repositionScenes();
    };

    window.addEventListener("resize", handleResize);

    // Start animation loop
    startAnimationLoop();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
      }
    };
  }, [isLoading]);

  // Effect to handle section changes
  useEffect(() => {
    if (!scenesRef.current || isLoading) return;
    
    // Hide all scenes
    Object.values(scenesRef.current).forEach(scene => {
      scene.visible = false;
    });
    
    // Show current scene
    if (scenesRef.current[currentSection]) {
      scenesRef.current[currentSection].visible = true;
      
      // Trigger transition animation between scenes
      animateSceneTransition(currentSection);
    }
  }, [currentSection, isLoading]);

  // Function to position elements within scenes
  const repositionScenes = () => {
    if (!appRef.current) return;
  
    // Home scene (unchanged)
    if (assetsRef.current.homeElements) {
      const { halfEarth, saturn, moon, rocket } = assetsRef.current.homeElements;
      halfEarth.width = window.innerWidth;
      const halfEarthAspectRatio = texturesRef.current.halfEarth.width / texturesRef.current.halfEarth.height;
      halfEarth.height = halfEarth.width / halfEarthAspectRatio;
      halfEarth.x = window.innerWidth / 2;
      halfEarth.y = window.innerHeight - halfEarth.height / 2;
  
      saturn.width = window.innerWidth * 0.15;
      const saturnAspectRatio = texturesRef.current.saturn.width / texturesRef.current.saturn.height;
      saturn.height = saturn.width / saturnAspectRatio;
      saturn.x = window.innerWidth * 0.8;
      saturn.y = window.innerHeight * 0.3;
  
      moon.width = window.innerWidth * 0.10;
      const moonAspectRatio = texturesRef.current.moon.width / texturesRef.current.moon.height;
      moon.height = moon.width / moonAspectRatio;
      moon.x = window.innerWidth * 0.2;
      moon.y = window.innerHeight * 0.2;
  
      rocket.width = 250;
      const rocketAspectRatio = texturesRef.current.rocket.width / texturesRef.current.rocket.height;
      rocket.height = rocket.width / rocketAspectRatio;
      rocket.x = 400;
      rocket.userData.baseY = window.innerHeight / 2;
      rocket.y = rocket.userData.baseY + Math.sin(rocket.userData.hoverTime * Math.PI / 2) * 20;
    }
  
    if (assetsRef.current.aboutBg) {
      const bgSprite = assetsRef.current.aboutBg;
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
    }
  
    if (assetsRef.current.officeBg) {
      const officeBg = assetsRef.current.officeBg;
      officeBg.width = window.innerWidth;
      officeBg.height = window.innerHeight;
    }
  
    if (assetsRef.current.table && assetsRef.current.monitor && assetsRef.current.characters) {
      const table = assetsRef.current.table;
      table.x = window.innerWidth / 2 + 270;
      table.y = window.innerHeight - table.height / 2 - 50;
      const monitor = assetsRef.current.monitor;
      monitor.x = table.x;
      monitor.y = table.y - 0;
      const coffeeCup = assetsRef.current.coffeeCup;
      coffeeCup.x = table.x + 60;
      coffeeCup.y = table.y - 0;
      const characters = assetsRef.current.characters;
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
  
    if (assetsRef.current.galleryElements) {
      const pathSprite = assetsRef.current.galleryElements.path;
      if (pathSprite) {
        // Resize path
        pathSprite.width = window.innerWidth;
        const aspectRatio = texturesRef.current.path.width / texturesRef.current.path.height;
        pathSprite.height = pathSprite.width / aspectRatio;
        pathSprite.x = 0;
        pathSprite.y = window.innerHeight - pathSprite.height;
  
        // Resize sky background
        const skyBg = assetsRef.current.galleryElements.skyBg;
        skyBg.clear();
        skyBg.beginFill(0x000022);
        skyBg.drawRect(0, 0, window.innerWidth, window.innerHeight * 0.6);
        skyBg.endFill();
  
        // Resize sunset gradient
        const sunsetGradient = assetsRef.current.galleryElements.sunsetGradient;
        sunsetGradient.clear();
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
  
        const buildings = assetsRef.current.galleryElements.buildings;
        const buildingWidth = pathSprite.width;
  
        if (buildings.pizza) {
          buildings.pizza.width = buildingWidth;
          const pizzaAspectRatio = texturesRef.current.pizza.width / texturesRef.current.pizza.height;
          buildings.pizza.height = buildings.pizza.width / pizzaAspectRatio;
          buildings.pizza.x = buildingWidth / 2;
          buildings.pizza.y = pathSprite.y + buildings.pizza.height / 2;
        }
        if (buildings.office) {
          buildings.office.width = buildingWidth;
          const officeAspectRatio = texturesRef.current.office.width / texturesRef.current.office.height;
          buildings.office.height = buildings.office.width / officeAspectRatio;
          buildings.office.x = buildingWidth / 2;
          buildings.office.y = pathSprite.y + buildings.office.height / 2;
        }
        if (buildings.bank) {
          buildings.bank.width = buildingWidth;
          const bankAspectRatio = texturesRef.current.bank.width / texturesRef.current.bank.height;
          buildings.bank.height = buildings.bank.width / bankAspectRatio;
          buildings.bank.x = buildingWidth / 2;
          buildings.bank.y = pathSprite.y + buildings.bank.height / 2 + 3;
        }
  
        const vehicles = assetsRef.current.galleryElements.vehicles;
        if (vehicles) {
          vehicles.forEach((vehicle: any) => {
            // Scale vehicles based on path height (20% of path height)
            const targetHeight = pathSprite.height * 0.7;
            const vehicleAspectRatio = vehicle.sprite.width / vehicle.sprite.height;
            vehicle.sprite.height = targetHeight;
            vehicle.sprite.width = targetHeight * vehicleAspectRatio;
  
            vehicle.baseY = pathSprite.y + pathSprite.height * 0.95;
            vehicle.sprite.y = vehicle.baseY + vehicle.shakeOffset;
          });
        }
      }
    }
  };

  // Animation loop
  const startAnimationLoop = () => {
    const animate = () => {
      if (!appRef.current) return;
      
      // Update star positions in home scene
      updateHomeScene();
      
      // Update clouds in about scene
      updateAboutScene();
      
      // Update city elements in gallery scene
      updateGalleryScene();
      
      // Update character animations in download scene
      updateDownloadScene();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

// First, let's add an interface for our comet objects
interface Comet extends PIXI.Graphics {
  userData: {
    speed: number;
    tailLength: number;
    angle: number;
  };
}

// Modify initHomeScene to add comets
const initHomeScene = (scene: PIXI.Container) => {
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

  // Create a container for comets to manage their layering
  const cometsContainer = new PIXI.Container();
  scene.addChild(cometsContainer);
  assetsRef.current.cometsContainer = cometsContainer;

  // Add comets to the cometsContainer
  for (let i = 0; i < 5; i++) {
    createComet(cometsContainer);
  }

  // Moon (moved up to be behind Earth and Rocket)
  const moonSprite = new PIXI.Sprite(texturesRef.current.moon);
  moonSprite.anchor.set(0.5, 0.5);
  moonSprite.width = window.innerWidth * 0.10;
  const moonAspectRatio = texturesRef.current.moon.width / texturesRef.current.moon.height;
  moonSprite.height = moonSprite.width / moonAspectRatio;
  moonSprite.x = window.innerWidth * 0.2;
  moonSprite.y = window.innerHeight * 0.2;
  moonSprite.userData = { rotationSpeed: 2 * Math.PI / 60 }; // 60s rotation
  scene.addChild(moonSprite);

  // Saturn (moved up to be behind Earth and Rocket)
  const saturnSprite = new PIXI.Sprite(texturesRef.current.saturn);
  saturnSprite.anchor.set(0.5, 0.5);
  saturnSprite.width = window.innerWidth * 0.15;
  const saturnAspectRatio = texturesRef.current.saturn.width / texturesRef.current.saturn.height;
  saturnSprite.height = saturnSprite.width / saturnAspectRatio;
  saturnSprite.x = window.innerWidth * 0.8;
  saturnSprite.y = window.innerHeight * 0.3;
  saturnSprite.userData = { rotationSpeed: 2 * Math.PI / 120 }; // 120s rotation
  scene.addChild(saturnSprite);

  // Half Earth (moved down to be in front of Moon and Saturn)
  const halfEarthSprite = new PIXI.Sprite(texturesRef.current.halfEarth);
  halfEarthSprite.anchor.set(0.5, 0.5);
  halfEarthSprite.width = window.innerWidth;
  const halfEarthAspectRatio = texturesRef.current.halfEarth.width / texturesRef.current.halfEarth.height;
  halfEarthSprite.height = halfEarthSprite.width / halfEarthAspectRatio;
  halfEarthSprite.x = window.innerWidth / 2;
  halfEarthSprite.y = window.innerHeight - halfEarthSprite.height / 2;
  scene.addChild(halfEarthSprite);

  // Rocket (stays last to be in front of everything)
  const rocketSprite = new PIXI.Sprite(texturesRef.current.rocket);
  rocketSprite.anchor.set(0.5, 0.5);
  rocketSprite.width = 250;
  const rocketAspectRatio = texturesRef.current.rocket.width / texturesRef.current.rocket.height;
  rocketSprite.height = rocketSprite.width / rocketAspectRatio;
  rocketSprite.x = 400;
  rocketSprite.y = window.innerHeight / 2;
  rocketSprite.rotation = -20 * (Math.PI / 180); // Initial -20deg rotation
  rocketSprite.userData = { 
    hoverTime: 0,
    baseY: rocketSprite.y
  };
  scene.addChild(rocketSprite);

  // Store in assetsRef for animation and resizing
  assetsRef.current.homeElements = {
    halfEarth: halfEarthSprite,
    saturn: saturnSprite,
    moon: moonSprite,
    rocket: rocketSprite
  };
};

// Function to create a comet
const createComet = (scene: PIXI.Container) => {
  const comet = new PIXI.Graphics() as Comet;
  
  // Randomize comet properties
  const speed = Math.random() * 2 + 1; // Speed between 1-3
  const tailLength = Math.random() * 30 + 20; // Tail length between 20-50
  const angle = Math.random() * Math.PI * 2; // Random angle in radians
  
  // Store properties in userData
  comet.userData = {
    speed,
    tailLength,
    angle
  };
  
  // Set initial position off-screen
  const edgeOffset = 100;
  const screenEdge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
  
  switch (screenEdge) {
    case 0: // Top
      comet.x = Math.random() * window.innerWidth;
      comet.y = -edgeOffset;
      break;
    case 1: // Right
      comet.x = window.innerWidth + edgeOffset;
      comet.y = Math.random() * window.innerHeight;
      break;
    case 2: // Bottom
      comet.x = Math.random() * window.innerWidth;
      comet.y = window.innerHeight + edgeOffset;
      break;
    case 3: // Left
      comet.x = -edgeOffset;
      comet.y = Math.random() * window.innerHeight;
      break;
  }
  
  // Draw the comet (head and tail)
  drawComet(comet);
  
  // Add to scene
  scene.addChild(comet);
  
  return comet;
};

// Function to draw comet graphics
const drawComet = (comet: Comet) => {
  comet.clear();
  
  // Draw comet head (a bright point)
  comet.beginFill(0xFFFFFF);
  comet.drawRect(0, 0, 3, 3);
  comet.endFill();
  
  // Draw comet tail (a gradient)
  const tailLength = comet.userData.tailLength;
  const tailAngle = comet.userData.angle + Math.PI; // Tail points opposite of movement direction
  
  // Create gradient effect with decreasing alpha
  for (let i = 0; i < tailLength; i += 2) {
    const alpha = 1 - (i / tailLength);
    const width = Math.max(1, 3 - (i / tailLength) * 3); // Tail gets thinner
    
    const xOffset = Math.cos(tailAngle) * i;
    const yOffset = Math.sin(tailAngle) * i;
    
    comet.beginFill(0xCCFFFF, alpha);
    comet.drawRect(xOffset, yOffset, width, width);
    comet.endFill();
  }
};

// Function to create a cloud sprite
const createCloud = (scene: PIXI.Container, cloudType: number): CloudSprite => {
  // Choose cloud texture based on type
  let texture;
  switch (cloudType % 3) {
    case 0:
      texture = texturesRef.current.cloud1;
      break;
    case 1:
      texture = texturesRef.current.cloud2;
      break;
    default:
      texture = texturesRef.current.cloud3;
      break;
  }
  
  const cloud = new PIXI.Sprite(texture) as CloudSprite;
  
  // Set random scale to add variety (smaller size)
  const scale = Math.random() * 0.3 + 0.2; // Adjusted scale for smaller clouds
  cloud.scale.set(scale);
  
  // Randomly flip some clouds horizontally
  if (Math.random() > 0.5) {
    cloud.scale.x *= -1; // Flip horizontally
  }
  
  // Randomize cloud position
  const direction = Math.random() > 0.5 ? 1 : -1; // 1 for right, -1 for left
  
  if (direction > 0) {
    // If moving right, start from left side
    cloud.x = -cloud.width;
  } else {
    // If moving left, start from right side
    cloud.x = window.innerWidth + cloud.width;
  }
  
  cloud.y = Math.random() * (window.innerHeight / 2);
  
  // Assign cloud movement properties
  cloud.userData = {
    speed: (Math.random() * 0.5) + 0.2,
    direction: direction
  };
  
  scene.addChild(cloud);
  return cloud;
};

// Initialize about scene with background image and PNG clouds
const initAboutScene = (scene: PIXI.Container) => {
  // Add background image
  const background = new PIXI.Sprite(texturesRef.current.aboutBg);
  background.width = window.innerWidth;
  background.height = window.innerHeight;
  scene.addChild(background);
  assetsRef.current.aboutBg = background;
  
  // Create cloud container
  const clouds = new PIXI.Container();
  
  // Add multiple cloud sprites (increase the number of clouds)
  for (let i = 0; i < 30; i++) { // Increased number of clouds
    createCloud(clouds, i);
  }
  
  scene.addChild(clouds);
  assetsRef.current.clouds = clouds;
};

  // Initialize gallery scene (city with buildings)
  const initGalleryScene = (scene: PIXI.Container) => {
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
    const pizzaAspectRatio = texturesRef.current.pizza.width / texturesRef.current.pizza.height;
    pizzaSprite.height = pizzaSprite.width / pizzaAspectRatio;
    pizzaSprite.x = buildingWidth / 2;
    pizzaSprite.y = pathSprite.y + pizzaSprite.height / 2;
    cityContainer.addChild(pizzaSprite);
    
    const officeSprite = new PIXI.Sprite(texturesRef.current.office);
    officeSprite.anchor.set(0.5, 0.5);
    officeSprite.width = buildingWidth;
    const officeAspectRatio = texturesRef.current.office.width / texturesRef.current.office.height;
    officeSprite.height = officeSprite.width / officeAspectRatio;
    officeSprite.x = buildingWidth / 2;
    officeSprite.y = pathSprite.y + officeSprite.height / 2;
    cityContainer.addChild(officeSprite);
    
    const bankSprite = new PIXI.Sprite(texturesRef.current.bank);
    bankSprite.anchor.set(0.5, 0.5);
    bankSprite.width = buildingWidth;
    const bankAspectRatio = texturesRef.current.bank.width / texturesRef.current.bank.height;
    bankSprite.height = bankSprite.width / bankAspectRatio;
    bankSprite.x = buildingWidth / 2;
    bankSprite.y = pathSprite.y + bankSprite.height / 2 + 3;
    cityContainer.addChild(bankSprite);
    
    scene.addChild(cityContainer);
  
    const vehiclesContainer = new PIXI.Container();
    const numVehicles = 8;
    const vehicles = [];
    const spacing = window.innerWidth / numVehicles;
  
    for (let i = 0; i < numVehicles; i++) {
      const isCarTexture = i % 2 === 0;
      const vehicle = new PIXI.Sprite(isCarTexture ? texturesRef.current.car : texturesRef.current.taxi);
      vehicle.anchor.set(0.5, 0.5);
  
      // Scale vehicles based on path height (20% of path height)
      const targetHeight = pathSprite.height * 0.7; // 20% of path height
      const vehicleAspectRatio = vehicle.width / vehicle.height;
      vehicle.height = targetHeight;
      vehicle.width = targetHeight * vehicleAspectRatio;
  
      // Initial positioning
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
  
    // Adjust positions to avoid initial overlaps
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
      skyBg: skyBg,
      sunsetGradient: sunsetGradient,
      stars: stars,
      path: pathSprite,
      buildings: {
        bank: bankSprite,
        office: officeSprite,
        pizza: pizzaSprite
      },
      vehicles: vehicles
    };
  };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Initialize download scene (characters at computer)
// First, add the cup textures to your texturesRef.current object
// This goes inside your useEffect where you're loading textures
texturesRef.current = {
  halfEarth: PIXI.Texture.from('/images/Halfearth.png'),
  saturn: PIXI.Texture.from('/images/PLANET2_MAZE.png'),
  moon: PIXI.Texture.from('/images/PLANET6.png'),
  rocket: PIXI.Texture.from('/images/Rocket.png'),
  // Existing texture definitions...
  cloud1: PIXI.Texture.from('/images/cloud1.png'),
  cloud2: PIXI.Texture.from('/images/cloud2.png'),
  cloud3: PIXI.Texture.from('/images/cloud3.png'),
  aboutBg: PIXI.Texture.from('/images/Section_About_BG.png'),
  // Download scene textures
  officeBg: PIXI.Texture.from('/images/Download_Section/office_bg.png'),
  table: PIXI.Texture.from('/images/Download_Section/table.png'),
  monitor: PIXI.Texture.from('/images/Download_Section/monitor.png'),
  // Snoring man animation frames
  snoring1: PIXI.Texture.from('/images/Download_Section/snoring1.png'),
  snoring2: PIXI.Texture.from('/images/Download_Section/snoring2.png'),
  snoring3: PIXI.Texture.from('/images/Download_Section/snoring3.png'),
  snoring4: PIXI.Texture.from('/images/Download_Section/snoring4.png'),
  snoring5: PIXI.Texture.from('/images/Download_Section/snoring5.png'),
  // Web woman animation frames
  webwoman1: PIXI.Texture.from('/images/Download_Section/webwoman.png'),
  webwoman2: PIXI.Texture.from('/images/Download_Section/webwoman2.png'),
  // Add cup animation frames
  cup1: PIXI.Texture.from('/images/Download_Section/cup1.png'),
  cup2: PIXI.Texture.from('/images/Download_Section/cup2.png'),
  cup3: PIXI.Texture.from('/images/Download_Section/cup3.png'),
  cup4: PIXI.Texture.from('/images/Download_Section/cup4.png'),
  cup5: PIXI.Texture.from('/images/Download_Section/cup5.png'),

        // Gallery Section Images
        path: PIXI.Texture.from('/images/Screenshot_Section/path.png'),
        bank: PIXI.Texture.from('/images/Screenshot_Section/bank.png'),
        office: PIXI.Texture.from('/images/Screenshot_Section/office.png'),
        pizza: PIXI.Texture.from('/images/Screenshot_Section/pizza.png'),
        taxi: PIXI.Texture.from('/images/Screenshot_Section/taxi.png'),
        car: PIXI.Texture.from('/images/Screenshot_Section/car.png'),
};

// Now modify the initDownloadScene function to add the cup alongside the monitor
const initDownloadScene = (scene: PIXI.Container) => {
  // Office background
  const officeBg = new PIXI.Sprite(texturesRef.current.officeBg);
  officeBg.width = window.innerWidth;
  officeBg.height = window.innerHeight;
  scene.addChild(officeBg);
  assetsRef.current.officeBg = officeBg;
  
  // Add table in the middle of the screen - ENLARGED and shifted right
  const table = new PIXI.Sprite(texturesRef.current.table);
  table.anchor.set(0.5, 0.5);
  // Increase scale for larger table (1.5x)
  table.scale.set(1.5);
  // Move 100px to the right and 50px down
  table.x = window.innerWidth / 2 + 270;
  table.y = window.innerHeight - table.height / 2 - 50; // -150 + 50 = -100
  scene.addChild(table);
  assetsRef.current.table = table;
  
  // Add monitor on top of the table - MOVED with table
  const monitor = new PIXI.Sprite(texturesRef.current.monitor);
  monitor.anchor.set(0.5, 0.5);
  // Increase scale for larger monitor (1.5x)
  monitor.scale.set(1.5);
  // Position relative to updated table position
  monitor.x = table.x;
  monitor.y = table.y - 0;
  scene.addChild(monitor);
  assetsRef.current.monitor = monitor;
  
  // Add coffee cup on the monitor - MOVED with table
  const coffeeCup = new PIXI.Sprite(texturesRef.current.cup1);
  coffeeCup.anchor.set(0.5, 0.5);
  // Increase scale for larger cup (1.5x)
  coffeeCup.scale.set(1.5);
  // Position relative to updated table position
  coffeeCup.x = table.x + 60; // Keep same relative position to table
  coffeeCup.y = table.y - 0;
  scene.addChild(coffeeCup);
  assetsRef.current.coffeeCup = coffeeCup;
  
  // Create a container for characters to manage depth
  const charactersContainer = new PIXI.Container();
  scene.addChild(charactersContainer);
  
  // Create sleeping character (man) - MOVED with table
  const snoringMan = new PIXI.Sprite(texturesRef.current.snoring1);
  snoringMan.anchor.set(0.5, 0.5);
  snoringMan.scale.set(1.5);
  // Position relative to updated table position
  snoringMan.x = table.x - 30; // Keep same relative position to table
  snoringMan.y = table.y + 72;
  charactersContainer.addChild(snoringMan);
  
  // Create woman character - MOVED with table
  const webWoman = new PIXI.Sprite(texturesRef.current.webwoman1);
  webWoman.anchor.set(0.5, 0.5);
  webWoman.scale.set(1.5);
  // Position relative to updated table position
  webWoman.x = table.x + 25; // Keep same relative position to table
  webWoman.y = table.y + 0;
  charactersContainer.addChild(webWoman);
      
  // Store characters for animation
  assetsRef.current.characters = {
    snoringMan: snoringMan,
    webWoman: webWoman,
    // Animation timers and states
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

// Update updateHomeScene to handle comets
const updateHomeScene = () => {
  if (!scenesRef.current.home.visible) return;

  // Animate stars (still in the main scene)
  scenesRef.current.home.children.forEach(child => {
    if (child instanceof PIXI.Graphics && child.userData && child.userData.blinkRate) {
      const star = child as ExtendedGraphics;
      star.alpha += star.userData.blinkRate * star.userData.blinkDir;
      if (star.alpha > 1) {
        star.alpha = 1;
        star.userData.blinkDir = -1;
      } else if (star.alpha < 0.3) {
        star.alpha = 0.3;
        star.userData.blinkDir = 1;
      }
    }
  });

  // Animate comets (now in cometsContainer)
  if (assetsRef.current.cometsContainer) {
    assetsRef.current.cometsContainer.children.forEach(child => {
      if (child instanceof PIXI.Graphics && child.userData && child.userData.speed !== undefined) {
        const comet = child as Comet;
        comet.x += Math.cos(comet.userData.angle) * comet.userData.speed;
        comet.y += Math.sin(comet.userData.angle) * comet.userData.speed;
        drawComet(comet);
        const padding = 200;
        if (
          comet.x < -padding ||
          comet.x > window.innerWidth + padding ||
          comet.y < -padding ||
          comet.y > window.innerHeight + padding
        ) {
          assetsRef.current.cometsContainer.removeChild(comet);
          createComet(assetsRef.current.cometsContainer); // Add new comet to cometsContainer
        }
      }
    });
  }

  // Animate planets and rocket
  if (assetsRef.current.homeElements) {
    const { saturn, moon, rocket } = assetsRef.current.homeElements;

    // Saturn rotation
    if (saturn.userData && saturn.userData.rotationSpeed) {
      saturn.rotation += saturn.userData.rotationSpeed / 60; // Assuming 60 FPS
    }

    // Moon rotation
    if (moon.userData && moon.userData.rotationSpeed) {
      moon.rotation += moon.userData.rotationSpeed / 60;
    }

    // Rocket hover
    if (rocket.userData) {
      rocket.userData.hoverTime += 0.033; // ~30 FPS increment
      const hoverOffset = Math.sin(rocket.userData.hoverTime * Math.PI / 2) * 20; // 4s cycle, 20px range
      rocket.y = rocket.userData.baseY + hoverOffset;
      rocket.rotation = (-20 + (hoverOffset / 20) * 5) * (Math.PI / 180); // -20 to -15deg
    }
  }
};

// Update clouds in about scene
const updateAboutScene = () => {
  if (!scenesRef.current.about.visible || !assetsRef.current.clouds) return;

  // Move clouds
  assetsRef.current.clouds.children.forEach(child => {
    const cloud = child as CloudSprite;
    if (cloud.userData && cloud.userData.speed) {
      cloud.x += cloud.userData.direction === 1 ? cloud.userData.speed : -cloud.userData.speed;

      // Loop clouds back to the opposite side when they exit the screen
      if (cloud.x < -cloud.width) {
        cloud.x = window.innerWidth;
      } else if (cloud.x > window.innerWidth) {
        cloud.x = -cloud.width;
      }
    }
  });
}
  
  // Animate stars (twinkling)
  const updateGalleryScene = () => {
    if (!scenesRef.current.gallery.visible || !assetsRef.current.galleryElements) return;
    const galleryElements = assetsRef.current.galleryElements;
    
    if (galleryElements.stars) {
      galleryElements.stars.children.forEach(child => {
        const star = child as ExtendedGraphics;
        if (star.userData && star.userData.blinkRate) {
          star.alpha += star.userData.blinkRate * star.userData.blinkDir;
          if (star.alpha > 1) {
            star.alpha = 1;
            star.userData.blinkDir = -1;
          } else if (star.alpha < 0.3) {
            star.alpha = 0.3;
            star.userData.blinkDir = 1;
          }
        }
      });
    }
    
    if (galleryElements.vehicles) {
      // First, update all vehicle positions
      galleryElements.vehicles.forEach((vehicle: any) => {
        // Move left to right with increased speed
        vehicle.sprite.x += vehicle.speed;
        
        // Realistic car-like shaking
        vehicle.shakeTime += 0.3;
        const vibration = Math.random() * 0.5; // Random engine vibration
        const bumpFactor = Math.sin(vehicle.shakeTime * 0.3) > 0.8 ? 1 : 0; // Occasional bumps
        const bump = bumpFactor * (Math.random() * 1.2); // Random bump height when active
        vehicle.shakeOffset = vibration + bump;
        vehicle.sprite.y = vehicle.baseY + vehicle.shakeOffset;
        vehicle.sprite.rotation = vehicle.shakeOffset * 0.01; // Subtle tilt
      });
      
      // Check if we need to spawn any new vehicles (if there are none visible on screen)
      let visibleVehicles = galleryElements.vehicles.filter(v => 
        v.sprite.x > -v.sprite.width && v.sprite.x < window.innerWidth + v.sprite.width
      );
      
      // If no vehicles are visible and none are about to enter, force spawn one
      if (visibleVehicles.length === 0 && !galleryElements.vehicles.some(v => v.sprite.x > -v.sprite.width * 2 && v.sprite.x < 0)) {
        // Find the vehicle furthest to the right and bring it to the left edge
        let furthestVehicle = galleryElements.vehicles[0];
        for (let i = 1; i < galleryElements.vehicles.length; i++) {
          if (galleryElements.vehicles[i].sprite.x > furthestVehicle.sprite.x) {
            furthestVehicle = galleryElements.vehicles[i];
          }
        }
        furthestVehicle.sprite.x = -furthestVehicle.sprite.width;
        furthestVehicle.speed = Math.random() * 1 + 3; // Faster speed for initial vehicle
      }
      
      // Then check for vehicles that need respawning
      for (let i = 0; i < galleryElements.vehicles.length; i++) {
        const vehicle = galleryElements.vehicles[i];
        
        // If vehicle is off-screen to the right, reset its position
        if (vehicle.sprite.x > window.innerWidth + vehicle.sprite.width) {
          // Position it just slightly off-screen to the left (closer than before)
          vehicle.sprite.x = -vehicle.sprite.width * 1.2; // Only 1.2x width off screen instead of 2x
          
          // Check for any potential collisions with other vehicles
          let hasCollision = true;
          let attempts = 0;
          const maxAttempts = 10;
          
          // Try to find a position without collisions
          while (hasCollision && attempts < maxAttempts) {
            hasCollision = false;
            attempts++;
            
            // Check distance to all other vehicles
            for (let j = 0; j < galleryElements.vehicles.length; j++) {
              if (i === j) continue; // Skip self
              
              const otherVehicle = galleryElements.vehicles[j];
              const minSafeDistance = (vehicle.sprite.width + otherVehicle.sprite.width) * 0.7;
              const distance = Math.abs(vehicle.sprite.x - otherVehicle.sprite.x);
              
              if (distance < minSafeDistance) {
                hasCollision = true;
                // Move further left to avoid collision, but not too far
                vehicle.sprite.x -= minSafeDistance;
                break;
              }
            }
          }
          
          // Faster speeds for quicker appearance
          vehicle.speed = Math.random() * 1 + 2.5; // Speed between 2.5-3.5
        }
      }
    }
  };

  const updateDownloadScene = () => {
    if (!scenesRef.current.download.visible || !assetsRef.current.characters) return;
    
    const characters = assetsRef.current.characters;
    const animState = characters.animationState;
    
    // Animation logic remains the same
    // Update snoring man animation
    animState.snoringFrameTimer += 1;
    if (animState.snoringFrameTimer > 10) {
      animState.snoringFrameTimer = 0;
      animState.snoringFrame = (animState.snoringFrame + 1) % 5;
      
      const frameTexture = texturesRef.current[`snoring${animState.snoringFrame + 1}`];
      if (frameTexture && characters.snoringMan) {
        characters.snoringMan.texture = frameTexture;
      }
    }
    
    // Update web woman animation
    animState.webWomanFrameTimer += 1;
    if (animState.webWomanFrameTimer > 30) {
      animState.webWomanFrameTimer = 0;
      animState.webWomanFrame = animState.webWomanFrame === 0 ? 1 : 0;
      
      const frameTexture = texturesRef.current[`webwoman${animState.webWomanFrame + 1}`];
      if (frameTexture && characters.webWoman) {
        characters.webWoman.texture = frameTexture;
      }
    }
    
    // Update coffee cup animation
    animState.cupFrameTimer += 1;
    if (animState.cupFrameTimer > 15) {
      animState.cupFrameTimer = 0;
      animState.cupFrame = (animState.cupFrame + 1) % 5;
      
      const cupTexture = texturesRef.current[`cup${animState.cupFrame + 1}`];
      if (cupTexture && assetsRef.current.coffeeCup) {
        assetsRef.current.coffeeCup.texture = cupTexture;
      }
    }
    
    // Modified position updates to maintain consistency with coffee cup
    if (assetsRef.current.table && assetsRef.current.monitor && assetsRef.current.coffeeCup) {
      const table = assetsRef.current.table;
      // Move 100px right and 50px down
      table.x = window.innerWidth / 2 + 270;
      table.y = window.innerHeight - table.height / 2 - 50; // -150 + 50 = -100
      
      const monitor = assetsRef.current.monitor;
      // Position relative to table
      monitor.x = table.x;
      monitor.y = table.y - 0;
      
      const coffeeCup = assetsRef.current.coffeeCup;
      // Position relative to table
      coffeeCup.x = table.x + 60;
      coffeeCup.y = table.y - 0;
      
      // Update character positions relative to table
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
    
    // Update background to fill screen if resized
    if (assetsRef.current.officeBg) {
      assetsRef.current.officeBg.width = window.innerWidth;
      assetsRef.current.officeBg.height = window.innerHeight;
    }
  };

  // Animate transitions between scenes
  const animateSceneTransition = (targetSection: string) => {
    // Implement specific transition effects based on which section we're navigating to
    switch (targetSection) {
      case "about":
        // Earth rising transition
        if (assetsRef.current.earthTransition) {
          // Animation code would go here
        }
        break;
      case "gallery":
        // City transition
        break;
      case "download":
        // Zoom to building window transition
        break;
      default:
        // Default fade transition handled by CSS/motion
        break;
    }
  };

  // Handle CTA button click
  const handleBeginAdventure = () => {
    setCurrentSection("about");
  };

  // Handle navigation
  const navigateTo = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="djangoquest-app">
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <h1>DJANGO QUEST</h1>
            <div className="loading-bar-container">
              <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p>{loadingText}</p>
          </div>
        </div>
      )}

      {/* Add Navbar and pass setCurrentSection */}
      {!isLoading && <Navbar setCurrentSection={setCurrentSection} />}

      {/* Pixelated background container for PixiJS */}
      <div ref={pixiContainerRef} className="pixi-container"></div>
      
      {/* UI Overlay - Only show elements relevant to current section */}
      <div className="ui-overlay">
        
        {/* Section-specific content */}
        {!isLoading && currentSection === "home" && (
          <motion.div 
            className="home-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="hero-text">
              <h1>DJANGO QUEST</h1>
              <h2>Learn Django the Fun Way – Through Adventure!</h2>
              <button className="cta-button" onClick={handleBeginAdventure}>
                Begin Your Adventure
              </button>
            </div>
          </motion.div>
        )}
        
        {!isLoading && currentSection === "about" && (
          <motion.div 
            className="about-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="about-layout">
              <div className="about-logo">
                <img src="DQUESTLOGO.svg" alt="DjangoQuest Logo" className="dquest-logo" />
              </div>
              <div className="about-text">
                <h2>About DjangoQuest</h2>
                <p>Embark on an epic journey to master Django through our interactive pixelated adventure game.</p>
                <p>Learn Python web development concepts while solving puzzles and completing quests.</p>
                <button className="cta-button" onClick={() => navigateTo("gallery")}>
                  View Screenshots
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {!isLoading && currentSection === "gallery" && (
          <motion.div 
            className="gallery-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2>Game Screenshots</h2>
            <div className="screenshot-grid">
              {/* Placeholder for screenshots */}
              <div className="screenshot">Screenshot 1</div>
              <div className="screenshot">Screenshot 2</div>
              <div className="screenshot">Screenshot 3</div>
              <div className="screenshot">Screenshot 4</div>
            </div>
            <button className="cta-button" onClick={() => navigateTo("download")}>
              Download Now
            </button>
          </motion.div>
        )}
        
        {!isLoading && currentSection === "download" && (
          <motion.div 
            className="download-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2>Ready to Play?</h2>
            <p>Download DjangoQuest and start your learning adventure today!</p>
            <a href="/download" className="download-button">Download Now</a>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;