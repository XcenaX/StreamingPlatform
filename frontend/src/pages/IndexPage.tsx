import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useHost } from "../contexts/HostContext";

type Stream = {
  id: number;
  title: string;
  username: string;
  thumbnail_url?: string;
};

export default function IndexPage() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { host, protocol } = useHost();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${protocol}://${host}:8000/stream/active`)
      .then((res) => res.json())
      .then((data) => setStreams(data))
      .catch(() => setStreams([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ width: "100vw" }}>
      <Navbar />
      
      <Grid container spacing={0} sx={{ height: "calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <Grid item xs={12} md={sidebarOpen ? 2 : 0.5} sx={{ display: { sm: "none", xs: "block" }}}>
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen((prev) => !prev)}
            channels={[]}
          />
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={sidebarOpen ? 10 : 11.5}>
        <Container sx={{ p: 4, maxWidth: "unset !important" }}>          
          {loading ? (
            <Box
              sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : streams.length === 0 ? (
            <Typography variant="body1">Нет активных стримов 😔</Typography>
          ) : (
            <Grid container spacing={3}>
              {streams.map((stream) => (
                <Grid item xs={12} sm={6} md={4} key={stream.id}>
                  <Card
                    sx={{ cursor: "pointer", height: "100%" }}
                    onClick={() => navigate(`/watch/${stream.username}`)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={stream.thumbnail_url || "/placeholder.jpg"}
                      alt={stream.title}
                    />
                    <CardContent>
                      <Typography variant="h6">{stream.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{stream.username}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
        </Grid>
      </Grid>
    </Box>
  );
}
