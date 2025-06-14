import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import type Player from "video.js/dist/types/player";

type ChatMessage = {
  text: string;
  username: string;
  timestamp: number;
};

type ChatBoxProps = {
  streamId: number;
  isLive?: boolean;
  playerRef: React.MutableRefObject<Player | null>;
  socket: WebSocket | null;
};

const ChatBox: React.FC<ChatBoxProps> = ({ streamId, isLive, playerRef, socket }) => {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { userId, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!isLive) {
      fetch(`/streams/${streamId}/messages`)
        .then((res) => res.json())
        .then((data) => setAllMessages(data));
    }
  }, [isLive, streamId]);

  useEffect(() => {
    if (!isLive && playerRef?.current) {
      let previousTime = 0;

      const interval = setInterval(() => {
        const currentTime = Math.floor(playerRef.current!.currentTime());
        if (currentTime < previousTime) {
          setMessages([]);
        }

        const newMessages = allMessages.filter(
          (msg) => msg.timestamp > previousTime && msg.timestamp <= currentTime
        );

        if (newMessages.length > 0) {
          setMessages((prev) => {
            const updated = [...prev, ...newMessages];
            return updated.length > 200 ? updated.slice(-200) : updated;
          });
        }

        previousTime = currentTime;
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLive, allMessages, playerRef]);

  useEffect(() => {
    if (!isLive || !socket) return;

    socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        setMessages((prev) => {
          const updated = [...prev, data];
          return updated.length > 200 ? updated.slice(-200) : updated;
        });
      }
    };
  }, [socket, isLive]);

  const sendMessage = () => {
    if (!isLive || !socket) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (input.trim() && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ text: input }));
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "2px solid #18181b",
        backgroundColor: "#0e0e10",
        color: "#DEDEE3",        
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 1,
          backgroundColor: "#0e0e10",
        }}
      >
        {messages.map((msg, i) => (
          <Box key={i} sx={{ mb: 1, pl: 1, pr: 1 }}>
            <Typography variant="body2">
              <strong>{msg.username}:</strong> {msg.text}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {isLive && (
        <Box sx={{ display: "flex", mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Box>
      )}

      <Dialog open={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <Typography>You must be logged in to send messages.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginModal(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatBox;
