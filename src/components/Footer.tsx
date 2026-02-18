import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box sx={{ textAlign: "center", py: 2, backgroundColor: "#1a1a1a", color: "white" }}>
      <Typography variant="body2">© {new Date().getFullYear()} DjangoQuest. All Rights Reserved.</Typography>
    </Box>
  );
};

export default Footer;
