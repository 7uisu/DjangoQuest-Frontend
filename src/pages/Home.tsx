import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import logo from "../assets/DQUESTLOGO.svg";

interface HomeProps {
  currentSection: string;
  setCurrentSection: (section: string) => void;
}

const platformHighlights = [
  "Student registration and classroom enrollment",
  "Teacher dashboards for progress monitoring",
  "Game progress, achievements, and leaderboards",
  "Video tutorials and downloadable completion certificates",
];

const screenshots = [
  { src: "/gallery/GalleryPic1.png", label: "Campus exploration" },
  { src: "/gallery/GalleryPic2.png", label: "Story progression" },
  { src: "/gallery/GalleryPic3.png", label: "Code challenge interface" },
  { src: "/gallery/GalleryPic4.png", label: "Professor assessment scene" },
];

const Home = ({ currentSection }: HomeProps) => {
  useEffect(() => {
    document.title = "DjangoQuest Learning Portal";
  }, []);

  useEffect(() => {
    document.getElementById(currentSection)?.scrollIntoView({ behavior: "smooth" });
  }, [currentSection]);

  return (
    <div className="home-page">
      <section id="home" className="home-hero">
        <div className="home-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Cavite State University - Bacoor Campus</p>
            <h1>DjangoQuest Learning Portal</h1>
            <p className="hero-lead">
              A web and game-based learning system for Python and Django instruction,
              classroom monitoring, and student progress tracking.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" to="/register">
                Create Account
              </Link>
              <Link className="secondary-action" to="/login">
                Sign In
              </Link>
            </div>
          </div>

          <div className="portal-summary" aria-label="DjangoQuest system summary">
            <div className="summary-header">
              <img src={logo} alt="DjangoQuest logo" />
              <div>
                <strong>Integrated Learning System</strong>
                <span>Game client, web portal, and backend API</span>
              </div>
            </div>
            <dl>
              <div>
                <dt>Students</dt>
                <dd>Play, learn, submit work, and track progress.</dd>
              </div>
              <div>
                <dt>Teachers</dt>
                <dd>Manage classrooms and monitor learning outcomes.</dd>
              </div>
              <div>
                <dt>Administrators</dt>
                <dd>Manage users, tutorials, announcements, and reports.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="about" className="home-section">
        <div className="home-container split-section">
          <div>
            <p className="eyebrow">About The System</p>
            <h2>Designed for academic use, not just gameplay.</h2>
          </div>
          <div className="section-copy">
            <p>
              DjangoQuest combines a Godot game client with a React web portal and Django
              REST backend. Students learn through interactive challenges while teachers
              and administrators can review classroom progress from the website.
            </p>
            <ul className="highlight-list">
              {platformHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="gallery" className="home-section surface-section">
        <div className="home-container">
          <div className="section-heading">
            <p className="eyebrow">System Preview</p>
            <h2>Learning activities and monitoring tools</h2>
          </div>
          <div className="screenshot-grid">
            {screenshots.map((shot) => (
              <figure className="screenshot-card" key={shot.src}>
                <img src={shot.src} alt={shot.label} />
                <figcaption>{shot.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="download" className="home-section">
        <div className="home-container download-panel">
          <div>
            <p className="eyebrow">Game Client</p>
            <h2>Download the Godot client for hands-on activities.</h2>
            <p>
              The website handles accounts, classrooms, tutorials, leaderboards, and
              monitoring. The downloadable game client handles the interactive lessons and
              coding challenges, then syncs progress to the backend.
            </p>
          </div>
          <div className="download-actions">
            <Link className="primary-action" to="/download">
              Download Game
            </Link>
            <Link className="secondary-action" to="/tutorials">
              View Tutorials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
