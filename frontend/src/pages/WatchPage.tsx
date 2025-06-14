import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Grid,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import TwitchStylePlayer from "../components/TwitchStylePlayer";
import ChatBox from "../components/ChatBox";
import { useHost } from "../contexts/HostContext";
import { useAuth } from "../contexts/AuthContext";
import Player from "video.js/dist/types/player";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


export default function WatchPage() {
  const { username } = useParams();
  const [stream, setStream] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const playerRef = useRef<Player | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { host, socketProtocol, protocol } = useHost();
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${protocol}://${host}:8000/stream/watch/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Stream not found");
        return res.json();
      })
      .then(setStream)
      .catch(() => setError("Стрим не найден"))
      .finally(() => setLoading(false));
  }, [username, host]);

  useEffect(() => {
    if (!stream?.id || !token) return;

    const wsUrl = `${socketProtocol}://${host}/ws/chat/${stream.id}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "viewers") {
        setViewerCount(data.count);
      }
    };

    return () => ws.close();
  }, [stream?.id, token, host, socketProtocol]);

  return (
    <Box sx={{ width: "100vw" }}>
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
        <Grid container spacing={0} sx={{ height: "calc(100vh - 64px)" }}>
          {/* Sidebar */}
          <Grid item xs={12} md={sidebarOpen ? 2 : 0.5}>
            <Box sx={{ position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto" }}>
              <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen((prev) => !prev)}
              />
            </Box>
          </Grid>


          {/* Player */}
          <Grid item xs={12} md={sidebarOpen ? 7 : 8.5}>
            <Box>
              <TwitchStylePlayer
                src={stream.hls_url}
                isLive={true}
                playerRef={playerRef}
              />
              <Box sx={{p:2}}>
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

                  <Box display="flex" alignItems="center" mb={1}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="gray">
                      {new Date(stream?.created_at).toLocaleString("ru-RU")}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {stream?.views || 0} просмотров
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {stream?.user?.about || "Автор пока ничего о себе не рассказал."}
                    </Typography>
                  </Box>

                </Box>
              </Box>

            </Box>
          </Grid>

          {/* Chat */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: "sticky", top: 64, height: "calc(100vh - 64px)" }}>
              <ChatBox
                streamId={stream.id}
                isLive={true}
                playerRef={playerRef}
                socket={wsRef.current}
              />
            </Box>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}
