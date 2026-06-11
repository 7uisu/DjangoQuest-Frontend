import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  AutoAwesome as SparkIcon,
  EmojiEvents as TrophyIcon,
  Leaderboard as LeaderboardIcon,
  MilitaryTech as BadgeIcon,
  PlayCircle as PlayIcon,
  School as SchoolIcon,
  TaskAlt as MissionIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/DQUESTLOGO.svg";
import "../styles/MarketingLanding.css";

export const LANDING_COMPLETE_KEY = "djangoquest-landing-complete";

const features = [
  {
    icon: <SchoolIcon />,
    title: "Interactive Lessons",
    description: "Tutorial content paired with hands-on coding practice.",
  },
  {
    icon: <MissionIcon />,
    title: "Story-Driven Quests",
    description: "Programming concepts taught through narrative tasks.",
  },
  {
    icon: <SparkIcon />,
    title: "XP & Progress Tracking",
    description: "Visible stats that reflect actual completion.",
  },
  {
    icon: <BadgeIcon />,
    title: "Badges & Achievements",
    description: "Milestone rewards for completion and challenges.",
  },
  {
    icon: <LeaderboardIcon />,
    title: "Leaderboards",
    description: "Classroom and platform-wide rankings.",
  },
  {
    icon: <TrophyIcon />,
    title: "Gamified Assessments",
    description: "Quizzes and code challenges tied to gameplay.",
  },
];



const screenshots = [
  "/gallery/GalleryPic1.png",
  "/gallery/GalleryPic3.png",
  "/gallery/GalleryPic4.png",
];

const MarketingLanding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);

  const dashboardTarget = useMemo(() => {
    if (user?.is_staff) return "/admin-dashboard";
    if (user?.is_teacher) return "/teacher-dashboard";
    if (user?.is_student) return "/dashboard";
    return "/login";
  }, [user]);

  const beginJourney = (target: string) => {
    localStorage.setItem(LANDING_COMPLETE_KEY, "true");
    setTransitionTarget(target);
    window.setTimeout(() => navigate(target), 1200);
  };

  return (
    <Box className="marketing-page">
      {transitionTarget && (
        <Box className="journey-transition" role="status" aria-live="polite">
          <img src={logo} alt="" />
          <Typography variant="h4">Welcome, Adventurer!</Typography>
          <Typography color="text.secondary">Preparing your learning journey...</Typography>
        </Box>
      )}

      <Container maxWidth="lg" className="marketing-shell">
        <Box className="marketing-topbar">
          <Box className="marketing-brand">
            <img src={logo} alt="DjangoQuest" />
            <span>DjangoQuest</span>
          </Box>
          <Button variant="text" onClick={() => beginJourney(dashboardTarget)}>
            {user ? "Open Dashboard" : "Sign In"}
          </Button>
        </Box>

        <section className="marketing-hero">
          <Box className="hero-content">
            <Chip label="Capstone Project" color="primary" variant="outlined" />
            <Typography component="h1">
              Learn Django through quests and code challenges.
            </Typography>
            <Typography className="hero-subcopy">
              A gamified learning platform where students practice Django through a Godot
              game client and teachers track progress from a web portal.
            </Typography>
            <Box className="hero-actions">
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayIcon />}
                onClick={() => beginJourney(dashboardTarget)}
              >
                Begin Your Quest
              </Button>
              {!user && (
                <Button variant="outlined" size="large" onClick={() => beginJourney("/register")}>
                  Create Account
                </Button>
              )}
            </Box>
          </Box>

          <Paper elevation={0} className="hero-product-panel">
            <Box className="panel-header">
              <span />
              <span />
              <span />
            </Box>
            <Box className="panel-body">
              <Typography variant="overline">Quest Progress</Typography>
              <Typography variant="h3">86%</Typography>
              <Typography color="text.secondary">Synced to teacher dashboard</Typography>
              <Box className="panel-progress">
                <span style={{ width: "86%" }} />
              </Box>
              <Grid container spacing={1.5}>
                {["XP +25", "Badge Unlocked", "Quiz Passed", "Rank Updated"].map((item) => (
                  <Grid item xs={6} key={item}>
                    <Box className="mini-stat">{item}</Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </section>

        <section className="marketing-section">
          <Box className="section-heading">
            <Typography variant="overline">Features</Typography>
            <Typography variant="h2">What's inside the platform.</Typography>
          </Box>
          <Grid container spacing={2.5}>
            {features.map((feature) => (
              <Grid item xs={12} md={4} key={feature.title}>
                <Paper elevation={0} className="feature-card">
                  <Box className="feature-icon">{feature.icon}</Box>
                  <Typography variant="h6">{feature.title}</Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </section>

        <section className="marketing-section">
          <Box className="section-heading">
            <Typography variant="overline">Preview</Typography>
            <Typography variant="h2">Screenshots from the actual platform.</Typography>
          </Box>
          <div className="screenshot-strip">
            {screenshots.map((src, index) => (
              <img src={src} alt={`DjangoQuest platform preview ${index + 1}`} key={src} />
            ))}
          </div>
        </section>



        <section className="marketing-cta">
          <Typography variant="h2">Ready to start?</Typography>
          <Typography color="text.secondary">
            Enter the app and begin your quest.
          </Typography>
          <Button variant="contained" size="large" onClick={() => beginJourney(dashboardTarget)}>
            Start Learning
          </Button>
        </section>
      </Container>
    </Box>
  );
};

export default MarketingLanding;
