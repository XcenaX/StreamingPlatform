import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, CircularProgress, Alert, Typography } from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TwitchStylePlayer from "../components/TwitchStylePlayer";
import ChatBox from "../components/ChatBox";
import { NAVBAR_HEIGHT } from "../constants/layout";
import Player from "video.js/dist/types/player";
import { useHost } from "../contexts/HostContext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


export default function VodPage() {
  const { username, streamId } = useParams();
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vodUrl, setVodUrl] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { host, protocol } = useHost();
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!streamId) return;
  
    fetch(`http://localhost:8000/stream/info/${streamId}`)
      .then((res) => res.json())
      .then((data) => {
        setStream(data);
        const url = `http://localhost:8081/${data.user.username}_stream${data.id}/master.m3u8`;
        setVodUrl(url);
      })
      .finally(() => setLoading(false));
  }, [streamId]);

  const parsedStreamId = streamId ? parseInt(streamId) : -1;

  return (
    <Box sx={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, width: "100vw", overflow: "hidden" }}>
      <Navbar />
      {loading ? (
        <Box sx={{ p: 4 }}>
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
        </Box>
      ) : error ? (
        <Box sx={{ p: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <Grid
          container
          spacing={0}
          sx={{
            width: "100vw",
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            m: 0,
            p: 0,
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          <Grid item xs={12} md={sidebarOpen ? 2 : 0.5}>
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen((prev) => !prev)}
              channels={[
                { username: "streamer1", avatarUrl: "", isLive: true, viewers: 145 },
                { username: "streamer2", avatarUrl: "", isLive: false },
              ]}
            />
          </Grid>

          {/* Player */}
          <Grid item xs={12} md={sidebarOpen ? 7 : 8.5}>
            <TwitchStylePlayer
              src={vodUrl}
              isLive={false}
              playerRef={playerRef}
            />
            <Box sx={{ mt: 2, p: 2, backgroundColor: "#1f1f23", borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>{stream?.title}</Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {(stream?.tags || []).map((tag: string, i: number) => (
                  <Box key={i} sx={{
                    backgroundColor: "#2c2c31",
                    px: 1.5, py: 0.5,
                    borderRadius: 999, fontSize: "0.75rem", color: "#DEDEE3"
                  }}>{tag}</Box>
                ))}
              </Box>

              <Typography variant="body2" color="gray" mb={1}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                {new Date(stream?.created_at).toLocaleString("ru-RU")}
              </Typography>

              <Typography variant="body2" mb={1}>
                <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                {stream?.views || 0} просмотров
              </Typography>

              <Typography variant="body2">
                <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                {stream?.user?.about || "Автор пока ничего о себе не рассказал."}
              </Typography>
            </Box>

          </Grid>

          {/* Chat */}
          <Grid item xs={12} md={3}>
            <ChatBox streamId={parsedStreamId} isLive={false} playerRef={playerRef} socket={null} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
