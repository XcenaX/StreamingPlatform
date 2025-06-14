import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from "../contexts/AuthContext";
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/my-streams');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
        >
          <Typography variant="h4" component="h1">
            Вход в аккаунт
          </Typography>

          <Button
            onClick={() => navigate("/register")}
            variant="text"
            color="primary"
            sx={{ textTransform: "none", fontWeight: 500 }}
          >
            Регистрация
          </Button>
        </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              type="text"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Войти
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </Container>
    </>
  );
}
