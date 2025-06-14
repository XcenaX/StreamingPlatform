import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  CardMedia,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useStreamApi } from "../hooks/useStreamApi";
import { useHost } from "../contexts/HostContext";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

interface Stream {
  id: number;
  title: string;
  status: string;
  created_at: string;
  watch_url: string;
  username: string;
  views: number;
}

export default function StreamCard({ stream }: { stream: Stream }) {
  const [deleted, setDeleted] = useState(false);
  const navigate = useNavigate();
  const { host, protocol } = useHost();
  const { deleteStream } = useStreamApi();

  if (deleted) {
    return <Box sx={{ display: "none" }} />;
  }

  const handleDelete = async () => {
    if (confirm("Удалить стрим?")) {
      await deleteStream(stream.id);
      setDeleted(true);
    }
  };

  const statusConfig: Record<string, { label: string; bgColor: string }> = {
    pending: { label: "🕓 Ожидание", bgColor: "#FFA726" }, // оранжевый
    live: { label: "🟢 LIVE", bgColor: "#EF5350" },         // красный
    finished: { label: "📼 VOD", bgColor: "#9E9E9E" },      // серый
  };

  const { label, bgColor  } = statusConfig[stream.status] || {
    label: "Неизвестно",
    bgColor : "#757575",
  };

  const previewUrl = `${protocol}://${host}:8081/${stream.username}_stream${stream.id}/preview.jpg`;
  const link =
    stream.status === "finished"
      ? `/vod/${stream.username}/${stream.id}`
      : `/watch/${stream.username}`;

  return (
    <Card
      sx={{
        backgroundColor: "#1f1f23",
        color: "white",
        height: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      onClick={() => navigate(link)}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="160"
          image={previewUrl}
          alt={stream.title}
        />

        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: bgColor,
            color: "white",
            fontSize: "0.7rem",
            px: 1,
            py: 0.3,
            borderRadius: 1,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            fontSize: "0.75rem",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            display: "flex",  
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
          {stream.status === "finished"
            ? `${stream.views} просмотров`
            : stream.status === "live"
            ? "43 зрителя"
            : ""}
        </Box>

      </Box>

      <CardContent>
        <Typography variant="h6" gutterBottom>
          {stream.title}
        </Typography>
        <Box display="flex" justifyContent="flex-start" alignItems="center" mt={1}>
          <Typography variant="body2" color="gray">
            {new Date(stream.created_at).toLocaleDateString("ru-RU")}
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          color="error"
          onClick={(e) => {
            e.stopPropagation(); // не перейти по карточке
            handleDelete();
          }}
        >
          Удалить
        </Button>
      </CardActions>
    </Card>
  );
}
