import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: "center",
        py: 2.5,
        px: 2,
        backgroundColor: "background.paper",
        color: "text.secondary",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} DjangoQuest. Cavite State University - Bacoor Campus.
      </Typography>
    </Box>
  );
};

export default Footer;
