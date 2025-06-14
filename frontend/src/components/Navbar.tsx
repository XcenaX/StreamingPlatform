import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { NAVBAR_HEIGHT } from "../constants/layout";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, logout } = useAuth();
  

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: NAVBAR_HEIGHT }} >
      
      <Typography
        variant="h6"
        component={Link}
        to="/"
        sx={{ color: "inherit", textDecoration: "none", lineHeight: 1.2, display: "flex", alignItems: "baseline", gap: 1, fontWeight: 500 }}
      >
        <Box component="img" src="/images/logo.png" alt="Логотип" sx={{ height: 40 }} />
        <Typography variant="h4" sx={{ color: "rgb(0 156 102)", fontWeight: "bold"}}>
          Trees
        </Typography>
      </Typography>


        <div>
          {isAuthenticated && !isLoadingAuth ? (
            <>
              <Button color="inherit" component={Link} to="/my-streams" sx={{ fontWeight: "bold"}}>Мои стримы</Button>
              <Button color="inherit" component={Link} to="/profile" sx={{ fontWeight: "bold"}}>Профиль</Button>
              <Button color="error" onClick={handleLogout} sx={{ fontWeight: "bold"}}>Выйти</Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ fontWeight: "bold"}}>Войти</Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
