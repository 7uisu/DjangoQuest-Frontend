import { Button, Container, Typography } from "@mui/material";

const DownloadPage = () => {
  return (
    <Container sx={{ textAlign: "center", marginTop: 5 }}>
      <Typography variant="h3" sx={{ fontFamily: "Press Start 2P, sans-serif" }}>
        Download DjangoQuest 🚀
      </Typography>

      <Typography variant="h5" sx={{ marginTop: 3 }}>
        Choose your version:
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, fontFamily: "Press Start 2P, sans-serif" }}
        href="/downloads/djangoquest-windows.zip"
        download
      >
        Download for Windows
      </Button>

      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, marginLeft: 2, fontFamily: "Press Start 2P, sans-serif" }}
        href="/downloads/djangoquest-linux.zip"
        download
      >
        Download for Linux
      </Button>

      <Button
        variant="contained"
        color="secondary"
        sx={{ marginTop: 2, marginLeft: 2, fontFamily: "Press Start 2P, sans-serif" }}
        href="/downloads/djangoquest-mac.zip"
        download
      >
        Download for macOS
      </Button>
    </Container>
  );
};

export default DownloadPage;
