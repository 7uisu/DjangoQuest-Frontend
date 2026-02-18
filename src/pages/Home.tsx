import "../styles/Home.css";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";

// Scene hooks
import { initHomeScene, updateHomeScene, repositionHomeScene } from '../hooks/useHomeScene';
import { initAboutScene, updateAboutScene, repositionAboutScene } from '../hooks/useAboutScene';
import { initGalleryScene, updateGalleryScene, repositionGalleryScene } from '../hooks/useGalleryScene';
import { initDownloadScene, updateDownloadScene, repositionDownloadScene } from '../hooks/useDownloadScene';

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
  const scenesRef = useRef<{ [key: string]: PIXI.Container }>({});
  const assetsRef = useRef<{ [key: string]: any }>({});
  const animationFrameRef = useRef<number | null>(null);
  const texturesRef = useRef<{ [key: string]: PIXI.Texture }>({});

  // Shared refs object passed to all scene hooks
  const sceneRefs = { texturesRef, assetsRef, scenesRef };

  // Simulate loading process
  useEffect(() => {
    const loadingSteps = [
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
        }, 500);
      }
    }, 700);

    return () => clearInterval(loadingInterval);
  }, []);

  // Initialize PixiJS
  useEffect(() => {
    document.title = "DjangoQuest - Learn Django the Fun Way";
    if (!pixiContainerRef.current || isLoading) return;

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000022,
      antialias: false,
      resolution: 1,
    });

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Load all textures
    texturesRef.current = {
      halfEarth: PIXI.Texture.from('/images/Halfearth.png'),
      saturn: PIXI.Texture.from('/images/PLANET2_MAZE.png'),
      moon: PIXI.Texture.from('/images/PLANET6.png'),
      rocket: PIXI.Texture.from('/images/Rocket.png'),
      cloud1: PIXI.Texture.from('/images/cloud1.png'),
      cloud2: PIXI.Texture.from('/images/cloud2.png'),
      cloud3: PIXI.Texture.from('/images/cloud3.png'),
      aboutBg: PIXI.Texture.from('/images/Section_About_BG.png'),
      path: PIXI.Texture.from('/images/Screenshot_Section/path.png'),
      bank: PIXI.Texture.from('/images/Screenshot_Section/bank.png'),
      office: PIXI.Texture.from('/images/Screenshot_Section/office.png'),
      pizza: PIXI.Texture.from('/images/Screenshot_Section/pizza.png'),
      taxi: PIXI.Texture.from('/images/Screenshot_Section/taxi.png'),
      car: PIXI.Texture.from('/images/Screenshot_Section/car.png'),
      officeBg: PIXI.Texture.from('/images/Download_Section/office_bg.png'),
      table: PIXI.Texture.from('/images/Download_Section/table.png'),
      monitor: PIXI.Texture.from('/images/Download_Section/monitor.png'),
      snoring1: PIXI.Texture.from('/images/Download_Section/snoring1.png'),
      snoring2: PIXI.Texture.from('/images/Download_Section/snoring2.png'),
      snoring3: PIXI.Texture.from('/images/Download_Section/snoring3.png'),
      snoring4: PIXI.Texture.from('/images/Download_Section/snoring4.png'),
      snoring5: PIXI.Texture.from('/images/Download_Section/snoring5.png'),
      webwoman1: PIXI.Texture.from('/images/Download_Section/webwoman.png'),
      webwoman2: PIXI.Texture.from('/images/Download_Section/webwoman2.png'),
      cup1: PIXI.Texture.from('/images/Download_Section/cup1.png'),
      cup2: PIXI.Texture.from('/images/Download_Section/cup2.png'),
      cup3: PIXI.Texture.from('/images/Download_Section/cup3.png'),
      cup4: PIXI.Texture.from('/images/Download_Section/cup4.png'),
      cup5: PIXI.Texture.from('/images/Download_Section/cup5.png')
    };

    pixiContainerRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // Create scene containers
    const homeScene = new PIXI.Container();
    const aboutScene = new PIXI.Container();
    const galleryScene = new PIXI.Container();
    const downloadScene = new PIXI.Container();

    scenesRef.current = { home: homeScene, about: aboutScene, gallery: galleryScene, download: downloadScene };

    app.stage.addChild(homeScene);
    app.stage.addChild(aboutScene);
    app.stage.addChild(galleryScene);
    app.stage.addChild(downloadScene);

    aboutScene.visible = false;
    galleryScene.visible = false;
    downloadScene.visible = false;

    // Initialize all scenes via hooks
    initHomeScene(homeScene, sceneRefs);
    initAboutScene(aboutScene, sceneRefs);
    initGalleryScene(galleryScene, sceneRefs);
    initDownloadScene(downloadScene, sceneRefs);

    // Resize handler
    const handleResize = () => {
      if (!appRef.current) return;
      appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      repositionHomeScene(sceneRefs);
      repositionAboutScene(sceneRefs);
      repositionGalleryScene(sceneRefs);
      repositionDownloadScene(sceneRefs);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      if (!appRef.current) return;
      updateHomeScene(sceneRefs);
      updateAboutScene(sceneRefs);
      updateGalleryScene(sceneRefs);
      updateDownloadScene(sceneRefs);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (appRef.current) appRef.current.destroy(true, { children: true });
    };
  }, [isLoading]);

  // Handle section changes
  useEffect(() => {
    if (!scenesRef.current || isLoading) return;

    Object.values(scenesRef.current).forEach(scene => {
      scene.visible = false;
    });

    if (scenesRef.current[currentSection]) {
      scenesRef.current[currentSection].visible = true;
    }
  }, [currentSection, isLoading]);

  const handleBeginAdventure = () => setCurrentSection("about");
  const navigateTo = (section: string) => setCurrentSection(section);

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

      {/* PixiJS container */}
      <div ref={pixiContainerRef} className="pixi-container"></div>

      {/* UI Overlay */}
      <div className="ui-overlay">
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