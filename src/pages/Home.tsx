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

const Home = () => {
  const [currentSection, setCurrentSection] = useState("home");
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
      cloud1: PIXI.Texture.from('/images/cloud1.png'),
      cloud2: PIXI.Texture.from('/images/cloud2.png'),
      cloud3: PIXI.Texture.from('/images/cloud3.png'),
      aboutBg: PIXI.Texture.from('/images/Section_About_BG.png')
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
    
    // Reposition about scene background to fill screen
    if (assetsRef.current.aboutBg) {
      const bgSprite = assetsRef.current.aboutBg;
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
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
  // Create starfield (keep your existing code)
  for (let i = 0; i < 150; i++) {
    const star = new PIXI.Graphics() as ExtendedGraphics;
    star.beginFill(0xFFFFFF);
    
    // Randomize star size for depth effect
    const size = Math.random() * 2 + 1;
    star.drawRect(0, 0, size, size); // Use rectangles for pixelated stars
    star.endFill();
    
    // Random position
    star.x = Math.floor(Math.random() * window.innerWidth);
    star.y = Math.floor(Math.random() * window.innerHeight);
    
    // Store blink timing
    star.alpha = Math.random() * 0.5 + 0.5;
    star.userData = { 
      blinkRate: Math.random() * 0.02 + 0.005,
      blinkDir: Math.random() > 0.5 ? 1 : -1
    };
    
    scene.addChild(star);
  }
  
  // Add comets
  for (let i = 0; i < 5; i++) {
    createComet(scene);
  }
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
    // City background with pixelated buildings
    const cityBg = new PIXI.Graphics();
    cityBg.beginFill(0x3a4663); // Dark blue evening sky
    cityBg.drawRect(0, 0, window.innerWidth, window.innerHeight);
    cityBg.endFill();
    scene.addChild(cityBg);
    
    // Create buildings skyline
    const buildings = new PIXI.Container();
    
    // Generate random buildings
    for (let i = 0; i < window.innerWidth; i += 20) {
      const height = Math.floor(Math.random() * 500) + 100;
      const building = new PIXI.Graphics() as ExtendedGraphics;
      
      // Main building
      building.beginFill(0x222222);
      building.drawRect(i, window.innerHeight - height, 60, height);
      building.endFill();
      
      // Windows
      building.beginFill(0xffcc44);
      const floors = Math.floor(height / 20);
      for (let floor = 0; floor < floors; floor++) {
        for (let windowNum = 0; windowNum < 2; windowNum++) {
          // Some windows are lit, some aren't
          if (Math.random() > 0.4) {
            building.drawRect(i + 5 + windowNum * 10, window.innerHeight - height + 5 + floor * 20, 5, 8);
          }
        }
      }
      building.endFill();
      
      buildings.addChild(building);
    }
    
    scene.addChild(buildings);
    
    // Mark one building for zoom effect
    assetsRef.current.zoomBuilding = {
      x: window.innerWidth / 2,
      y: window.innerHeight - 200,
      width: 30,
      height: 180
    };
  };

  // Initialize download scene (characters at computer)
  const initDownloadScene = (scene: PIXI.Container) => {
    // Room background
    const room = new PIXI.Graphics();
    room.beginFill(0xccccbb); // Wall color
    room.drawRect(0, 0, window.innerWidth, window.innerHeight);
    room.endFill();
    
    // Floor
    room.beginFill(0x8b4513); // Wood color
    room.drawRect(0, window.innerHeight - 100, window.innerWidth, 100);
    room.endFill();
    
    scene.addChild(room);
    
    // Add desk
    const desk = new PIXI.Graphics();
    desk.beginFill(0x663300);
    desk.drawRect(window.innerWidth / 2 - 100, window.innerHeight - 180, 200, 80);
    desk.endFill();
    scene.addChild(desk);
    
    // Add computer
    const computer = new PIXI.Graphics();
    computer.beginFill(0x333333);
    computer.drawRect(window.innerWidth / 2 - 50, window.innerHeight - 230, 100, 60);
    computer.endFill();
    
    // Computer screen
    computer.beginFill(0x88aaff);
    computer.drawRect(window.innerWidth / 2 - 45, window.innerHeight - 225, 90, 50);
    computer.endFill();
    
    // Django logo on screen
    computer.beginFill(0x44b78b);
    computer.drawRect(window.innerWidth / 2 - 20, window.innerHeight - 210, 40, 20);
    computer.endFill();
    
    scene.addChild(computer);
    
    // Create pixel characters (male and female)
    const maleChar = new PIXI.Graphics();
    maleChar.beginFill(0x3366cc); // Shirt color
    maleChar.drawRect(window.innerWidth / 2 - 60, window.innerHeight - 250, 20, 30);
    maleChar.endFill();
    
    // Male head
    maleChar.beginFill(0xffcc99);
    maleChar.drawRect(window.innerWidth / 2 - 55, window.innerHeight - 270, 10, 20);
    maleChar.endFill();
    
    scene.addChild(maleChar);
    
    const femaleChar = new PIXI.Graphics();
    femaleChar.beginFill(0xcc6699); // Shirt color
    femaleChar.drawRect(window.innerWidth / 2 + 40, window.innerHeight - 250, 20, 30);
    femaleChar.endFill();
    
    // Female head
    femaleChar.beginFill(0xffddaa);
    femaleChar.drawRect(window.innerWidth / 2 + 45, window.innerHeight - 270, 10, 20);
    femaleChar.endFill();
    
    scene.addChild(femaleChar);
    
    // Store characters for animation
    assetsRef.current.characters = {
      male: maleChar,
      female: femaleChar
    };
  };

// Update updateHomeScene to handle comets
const updateHomeScene = () => {
  if (!scenesRef.current.home.visible) return;
  
  // Animate stars (keep your existing code)
  scenesRef.current.home.children.forEach(child => {
    // Handle stars
    if (child instanceof PIXI.Graphics && 
        child.userData && 
        child.userData.blinkRate) {
      const star = child as ExtendedGraphics;
      // Create twinkling effect
      star.alpha += star.userData.blinkRate * star.userData.blinkDir;
      
      // Reverse direction when reaching alpha limits
      if (star.alpha > 1) {
        star.alpha = 1;
        star.userData.blinkDir = -1;
      } else if (star.alpha < 0.3) {
        star.alpha = 0.3;
        star.userData.blinkDir = 1;
      }
    }
    
    // Handle comets
    if (child instanceof PIXI.Graphics && 
        child.userData && 
        child.userData.speed !== undefined) {
      const comet = child as Comet;
      
      // Move comet based on angle and speed
      comet.x += Math.cos(comet.userData.angle) * comet.userData.speed;
      comet.y += Math.sin(comet.userData.angle) * comet.userData.speed;
      
      // Redraw comet in new position
      drawComet(comet);
      
      // Check if comet is off-screen and should be reset
      const padding = 200; // Extra padding to ensure tail is fully off-screen
      if (
        comet.x < -padding ||
        comet.x > window.innerWidth + padding ||
        comet.y < -padding ||
        comet.y > window.innerHeight + padding
      ) {
        // Remove old comet and create a new one
        scenesRef.current.home.removeChild(comet);
        createComet(scenesRef.current.home);
      }
    }
  });
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
};

  const updateGalleryScene = () => {
    if (!scenesRef.current.gallery.visible) return;
    
    // Subtle animation for city (lights flickering, etc.)
    scenesRef.current.gallery.children.forEach(container => {
      if (container instanceof PIXI.Container) {
        container.children.forEach(child => {
          const building = child as PIXI.Graphics;
          if (building instanceof PIXI.Graphics && Math.random() < 0.01) {
            // Occasionally toggle window lights
            building.tint = Math.random() > 0.5 ? 0xFFFFFF : 0xDDDDDD;
          }
        });
      }
    });
  };

  const updateDownloadScene = () => {
    if (!scenesRef.current.download.visible || !assetsRef.current.characters) return;
    
    // Animate characters (subtle movements)
    const male = assetsRef.current.characters.male;
    const female = assetsRef.current.characters.female;
    
    // Simple breathing animation
    male.y = window.innerHeight - 250 + Math.sin(Date.now() / 800) * 2;
    female.y = window.innerHeight - 250 + Math.sin(Date.now() / 900 + 1) * 2;
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
      
      {/* Planet and Rocket Images that will be positioned above the PixiJS canvas */}
      {!isLoading && currentSection === "home" && (
        <div className="space-objects">
          <img src="/images/Halfearth.png" alt="Half Earth" className="planet half-earth" />
          <img src="/images/Saturn.png" alt="Jupiter" className="planet jupiter" />
          <img src="/images/Moon.png" alt="Moon" className="planet moon" />
          <img src="/images/Rocket.png" alt="Rocket" className="rocket" />
        </div>
      )}
      
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
                <img src="/images/DQUESTLOGO.svg" alt="DjangoQuest Logo" className="dquest-logo" />
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