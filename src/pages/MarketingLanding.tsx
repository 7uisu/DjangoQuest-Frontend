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
    title: "Interactive Django Lessons",
    description: "Lessons combine tutorial content, coding practice, and guided feedback.",
  },
  {
    icon: <MissionIcon />,
    title: "Quests And Missions",
    description: "Students progress through story tasks connected to programming concepts.",
  },
  {
    icon: <SparkIcon />,
    title: "XP Progression",
    description: "XP, profile stats, and completion records help students see growth.",
  },
  {
    icon: <BadgeIcon />,
    title: "Achievements And Badges",
    description: "Milestones reward completion, persistence, and challenge performance.",
  },
  {
    icon: <LeaderboardIcon />,
    title: "Classroom Leaderboards",
    description: "Students can compare rankings by classroom or platform-wide XP.",
  },
  {
    icon: <TrophyIcon />,
    title: "Gamified Assessments",
    description: "Quizzes and code challenges connect grades to actual gameplay activity.",
  },
];

const testimonials = [
  {
    quote: "The game format made Django easier to follow because the tasks felt connected.",
    name: "BSIT Student",
  },
  {
    quote: "The dashboard gives a quicker view of student progress than manual checking.",
    name: "Programming Instructor",
  },
  {
    quote: "The quests helped me remember what each concept was used for.",
    name: "Computer Science Student",
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
            <Chip label="Gamified Django Learning Platform" color="primary" variant="outlined" />
            <Typography component="h1">
              Learn Django through quests, code challenges, and measurable progress.
            </Typography>
            <Typography className="hero-subcopy">
              DjangoQuest helps IT and Computer Science students practice programming through
              an interactive game client while teachers monitor learning progress from a
              formal web portal.
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
              <Typography variant="overline">Student Progress</Typography>
              <Typography variant="h3">86%</Typography>
              <Typography color="text.secondary">Story completion synced to classroom dashboard</Typography>
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
            <Typography variant="overline">Core Features</Typography>
            <Typography variant="h2">A learning platform with game momentum.</Typography>
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
            <Typography variant="overline">Platform Preview</Typography>
            <Typography variant="h2">From marketing page to actual learning workspace.</Typography>
          </Box>
          <div className="screenshot-strip">
            {screenshots.map((src, index) => (
              <img src={src} alt={`DjangoQuest platform preview ${index + 1}`} key={src} />
            ))}
          </div>
        </section>

        <section className="marketing-section">
          <Box className="section-heading">
            <Typography variant="overline">Feedback</Typography>
            <Typography variant="h2">Built around students and instructors.</Typography>
          </Box>
          <Grid container spacing={2.5}>
            {testimonials.map((item) => (
              <Grid item xs={12} md={4} key={item.name}>
                <Paper elevation={0} className="testimonial-card">
                  <Typography>"{item.quote}"</Typography>
                  <Typography variant="subtitle2">{item.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </section>

        <section className="marketing-cta">
          <Typography variant="h2">Ready to start learning?</Typography>
          <Typography color="text.secondary">
            Continue into the DjangoQuest application and begin tracking your progress.
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
