import React, { useEffect, useState, useMemo } from "react";
import { useStreamApi } from "../hooks/useStreamApi";
import { Link, useNavigate } from 'react-router-dom';
import StreamCard from "../components/StreamCard";
import Navbar from "../components/Navbar";
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function MyStreamsPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [statusFilter, setStatusFilter] = useState<"all" | "live" | "finished" | "pending">("all");
  const { getMyStreams } = useStreamApi();

  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoadingAuth) return;
  
    if (!isAuthenticated) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
      getMyStreams()
        .then((res) => setStreams(res.data))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isLoadingAuth]);
  

  const handleDialogClose = () => {
    navigate("/login");
  };

  const sortedStreams = useMemo(() => {
    const filtered = statusFilter === "all"
      ? streams
      : streams.filter((s) => s.status === statusFilter);

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.status.localeCompare(b.status);
    });
  }, [streams, sortBy, statusFilter]);

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 6}}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h4">🎬 Мои стримы</Typography>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={sortBy}
              label="Сортировка"
              onChange={(e) => setSortBy(e.target.value as "date" | "status")}
            >
              <MenuItem value="date">По дате</MenuItem>
              <MenuItem value="status">По статусу</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Фильтр</InputLabel>
            <Select
              value={statusFilter}
              label="Фильтр"
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="live">LIVE</MenuItem>
              <MenuItem value="finished">VOD</MenuItem>
              <MenuItem value="pending">Ожидание</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Правая часть: кнопка */}
        <Button variant="contained" component={Link} to="/create-stream">
          Создать стрим
        </Button>
      </Box>


        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            {sortedStreams.map((stream) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={stream.id}>
                <StreamCard stream={stream} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog open={showAuthDialog} onClose={handleDialogClose}>
        <DialogTitle>Требуется вход</DialogTitle>
        <DialogContent>
          <Typography>Для доступа к этой странице необходимо войти в систему.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus variant="contained">
            Ок
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
