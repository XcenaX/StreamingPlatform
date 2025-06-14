import React from "react";
import { Routes, Route } from "react-router-dom";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WatchPage from "./pages/WatchPage";
import MyStreamsPage from "./pages/MyStreamsPage";
import CreateStreamPage from "./pages/CreateStreamPage";
import VodPage from "./pages/VodPage";
import { NAVBAR_HEIGHT } from "./constants/layout";
import { Box } from "@mui/material";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Box sx={{ pt: `${NAVBAR_HEIGHT}px` }}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/watch/:username" element={<WatchPage />} />
        <Route path="/my-streams" element={<MyStreamsPage />} />
        <Route path="/vod/:username/:streamId" element={<VodPage />} />
        <Route path="/create-stream" element={<CreateStreamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Box>
  );
}

export default App;