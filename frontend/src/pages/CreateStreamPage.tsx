import React, { useEffect } from "react";
import { useState } from 'react';
import Navbar from '../components/Navbar';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useStreamApi } from "../hooks/useStreamApi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

export default function CreateStreamPage() {
  const [title, setTitle] = useState('');
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const { createStream } = useStreamApi();
  const { isAuthenticated, isLoadingAuth } = useAuth(); 
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoadingAuth) return;
  
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoadingAuth]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createStream(title);
      setStreamKey(res.data.stream_key);
    } catch (err) {
      setError('Ошибка при создании стрима');
    }
  };

  const copyToClipboard = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey);
      setCopied(true);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom>
            Создать стрим
          </Typography>
          <form onSubmit={handleCreate}>
            <TextField
              label="Название стрима"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Создать
            </Button>
          </form>

          {streamKey && (
            <Box sx={{ mt: 4, p: 2, bgcolor: '#2c2c2e', borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                🔐 Ключ трансляции:
              </Typography>
              <TextField
                value={streamKey}
                fullWidth
                type="password"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={copyToClipboard} color="primary">
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Snackbar
            open={copied}
            autoHideDuration={3000}
            onClose={() => setCopied(false)}
            message="Ключ скопирован в буфер"
          />
        </Box>
      </Container>
    </>
  );
}