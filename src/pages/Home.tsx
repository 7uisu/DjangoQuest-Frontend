import "../styles/Home.css";

import { motion, AnimatePresence } from "framer-motion";
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Home = ({ currentSection, setCurrentSection }: HomeProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const scenesRef = useRef<{ [key: string]: PIXI.Container }>({});
  const assetsRef = useRef<{ [key: string]: any }>({});
  const animationFrameRef = useRef<number | null>(null);
  const texturesRef = useRef<{ [key: string]: PIXI.Texture }>({});

  const sceneRefs = { texturesRef, assetsRef, scenesRef };

  // True Asset Loading
  useEffect(() => {
    document.title = "DjangoQuest - Learn Django the Fun Way";
    
    const loadAssets = async () => {
      const urls = [
        '/images/Halfearth.png', '/images/PLANET2_MAZE.png', '/images/PLANET6.png', '/images/Rocket.png',
        '/images/cloud1.png', '/images/cloud2.png', '/images/cloud3.png', '/images/Section_About_BG.png',
        '/images/Screenshot_Section/path.png', '/images/Screenshot_Section/bank.png', '/images/Screenshot_Section/office.png',
        '/images/Screenshot_Section/pizza.png', '/images/Screenshot_Section/taxi.png', '/images/Screenshot_Section/car.png',
        '/images/Download_Section/office_bg.png', '/images/Download_Section/table.png', '/images/Download_Section/monitor.png',
        '/images/Download_Section/snoring1.png', '/images/Download_Section/snoring2.png', '/images/Download_Section/snoring3.png',
        '/images/Download_Section/snoring4.png', '/images/Download_Section/snoring5.png', '/images/Download_Section/webwoman.png',
        '/images/Download_Section/webwoman2.png', '/images/Download_Section/cup1.png', '/images/Download_Section/cup2.png',
        '/images/Download_Section/cup3.png', '/images/Download_Section/cup4.png', '/images/Download_Section/cup5.png'
      ];
      
      try {
        await PIXI.Assets.load(urls, (progress) => {
          setLoadingProgress(Math.round(progress * 100));
        });
        
        // Let it stabilize and hide loading screen
        setTimeout(() => setIsLoading(false), 400);
      } catch (err) {
        console.error("Asset loading failed", err);
        setIsLoading(false); // Safety fallback
      }
    };
    
    loadAssets();
  }, []);

  // Initialize PixiJS
  useEffect(() => {
    if (!pixiContainerRef.current || isLoading) return;

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000022,
      antialias: false,
      resolution: 1,
    });

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    // Map cached textures
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

    // Initial State: Only home is visible
    aboutScene.visible = false;
    galleryScene.visible = false;
    downloadScene.visible = false;

    initHomeScene(homeScene, sceneRefs);
    initAboutScene(aboutScene, sceneRefs);
    initGalleryScene(galleryScene, sceneRefs);
    initDownloadScene(downloadScene, sceneRefs);

    const handleResize = () => {
      if (!appRef.current) return;
      appRef.current.renderer.resize(window.innerWidth, window.innerHeight);
      repositionHomeScene(sceneRefs);
      repositionAboutScene(sceneRefs);
      repositionGalleryScene(sceneRefs);
      repositionDownloadScene(sceneRefs);
    };

    window.addEventListener("resize", handleResize);

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

  // Sync Navbar button clicks with Scrolling by jumping to the ID.
  useEffect(() => {
    document.getElementById(currentSection)?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSection]);

  // Sync scroll depth with PixiJS Scene Visibility and Alpha crossfading!
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scenesRef.current) return;
    const scrollY = e.currentTarget.scrollTop;
    const h = window.innerHeight;

    const { home, about, gallery, download } = scenesRef.current;
    
    // Crossfade Logic (smooth alpha blends between scenes depending on screen height ratio)
    home.visible = false; about.visible = false; gallery.visible = false; download.visible = false;

    if (scrollY < h) {
      home.visible = true;
      home.alpha = 1 - (scrollY / h);
      if (scrollY > 0) {
        about.visible = true;
        about.alpha = scrollY / h;
      }
    } else if (scrollY < h * 2) {
      about.visible = true;
      about.alpha = 1 - ((scrollY - h) / h);
      if (scrollY > h) {
        gallery.visible = true;
        gallery.alpha = (scrollY - h) / h;
      }
    } else if (scrollY < h * 3) {
      gallery.visible = true;
      gallery.alpha = 1 - ((scrollY - h * 2) / h);
      if (scrollY > h * 2) {
        download.visible = true;
        download.alpha = (scrollY - h * 2) / h;
      }
    } else {
      download.visible = true;
      download.alpha = 1;
    }
  };

  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="djangoquest-app">
      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.85)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out'
            }}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={lightboxImg}
              alt="Zoomed Screenshot"
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
              }}
            />
            <button
              onClick={() => setLightboxImg(null)}
              style={{
                position: 'absolute',
                top: '20px', right: '30px',
                background: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '3rem',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <h1>DJANGO QUEST</h1>
            <div className="loading-bar-container">
              <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p>Decoding Game Assets...</p>
          </div>
        </div>
      )}

      {/* PixiJS Static Background */}
      <div ref={pixiContainerRef} className="pixi-container" style={{ position: "fixed" }}></div>

      {/* Vertical Scrolling UI Overlay */}
      <div className="ui-scroll-container" onScroll={handleScroll}>
        
        {/* HOMEPAGE SECTION */}
        <div id="home" className="scroll-section home-content pt-nav">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-text">
              <h1>DJANGO QUEST</h1>
              <h2>Learn Python Through Adventure!</h2>
              <button className="cta-button" onClick={() => navigateTo("about")}>
                Begin Your Adventure
              </button>
            </div>
          </motion.div>
        </div>

        {/* ABOUT SECTION */}
        <div id="about" className="scroll-section about-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-layout">
              <div className="about-logo">
                <img src="DQUESTLOGO.svg" alt="DjangoQuest Logo" className="dquest-logo animated-float" />
              </div>
              <div className="about-text">
                <h2>The Interactive Journey</h2>
                <p style={{marginBottom: "0.5rem", color: "#44b78b"}}>🎮 Story Mode RPG | ⚡ Multi-Tab Sandbox | 🤖 AI Hints</p>
                <p>Play through an interactive story where you learn coding visually! Solve code puzzles, help characters in the Post-Lecture Loop, and face your Final Defense.</p>
                <button className="cta-button" onClick={() => navigateTo("gallery")}>
                  View Screenshots
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* GALLERY SECTION */}
        <div id="gallery" className="scroll-section gallery-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h2>Game Screenshots</h2>
            <div className="screenshot-grid modern">
              <div className="screenshot-card" style={{ backgroundImage: "url('/gallery/GalleryPic1.png')", backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }} onClick={() => setLightboxImg('/gallery/GalleryPic1.png')}>
                <div className="screenshot-caption text-pixel">College Campus</div>
              </div>
              <div className="screenshot-card" style={{ backgroundImage: "url('/gallery/GalleryPic2.png')", backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }} onClick={() => setLightboxImg('/gallery/GalleryPic2.png')}>
                <div className="screenshot-caption text-pixel">Graduation</div>
              </div>
              <div className="screenshot-card" style={{ backgroundImage: "url('/gallery/GalleryPic3.png')", backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }} onClick={() => setLightboxImg('/gallery/GalleryPic3.png')}>
                <div className="screenshot-caption text-pixel">IDE</div>
              </div>
              <div className="screenshot-card" style={{ backgroundImage: "url('/gallery/GalleryPic4.png')", backgroundSize: "cover", backgroundPosition: "center", cursor: "zoom-in" }} onClick={() => setLightboxImg('/gallery/GalleryPic4.png')}>
                <div className="screenshot-caption text-pixel">Professor Cutscene</div>
              </div>
            </div>
            <button className="cta-button" onClick={() => navigateTo("download")} style={{ marginTop: "2rem" }}>
              Get It Now
            </button>
          </motion.div>
        </div>

        {/* DOWNLOAD SECTION */}
        <div id="download" className="scroll-section download-content">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.8 }}
            transition={{ duration: 0.6 }}
          >
            <div className="about-layout" style={{ flexDirection: 'column', textAlign: 'center', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#44b78b' }}>Ready to Play?</h2>
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Join the adventure today! Download the standalone game application to access the interactive sandbox editor directly on your device.
              </p>
              <div>
                <a href="/download" className="cta-button" style={{ display: 'inline-block', textDecoration: 'none', margin: '0 10px 10px 0' }}>Download Game</a>
                <a href="/login" className="cta-button" style={{ display: 'inline-block', textDecoration: 'none', backgroundColor: 'transparent', color: '#44b78b', border: '2px solid #44b78b', margin: '0 0 10px 0' }}>Student Login</a>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Home;