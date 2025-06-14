import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Avatar,
  Paper,
} from "@mui/material";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [about, setAbout] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setAbout(data.about || "");
        setAvatarUrl(data.avatar_url || "");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("http://localhost:8000/users/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ about, avatar_url: avatarUrl }),
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, backgroundColor: "#1f1f23", color: "white" }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              src={avatarUrl || "/placeholder.jpg"}
              sx={{ width: 64, height: 64 }}
            />
            <Box>
              <Typography variant="h6">{profile.username}</Typography>
              <Typography variant="body2" color="gray">
                Зарегистрирован:{" "}
                {new Date(profile.created_at).toLocaleDateString("ru-RU")}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Аватар (URL)"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            sx={{ mb: 2 }}
            variant="filled"
          />

          <TextField
            fullWidth
            multiline
            label="О себе"
            rows={4}
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            sx={{ mb: 2 }}
            variant="filled"
          />

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            fullWidth
          >
            {saving ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </Paper>
      </Container>
    </>
  );
}
