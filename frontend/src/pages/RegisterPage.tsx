import React from "react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(username, email, password);
      navigate('/login');
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
              Регистрация
            </Typography>
  
            <Button
              onClick={() => navigate("/login")}
              variant="text"
              color="primary"
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Уже есть аккаунт? Войти
            </Button>
          </Box>
          <form onSubmit={handleRegister}>
            <TextField
              label="Имя пользователя"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              name="some_text_so_google_wont_autofill_it"
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              name="some_text_so_google_wont_autofill_it2"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              name="some_text_so_google_wont_autofill_it3"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
              Зарегистрироваться
            </Button>
          </form>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </Container>
    </>
  );
}
