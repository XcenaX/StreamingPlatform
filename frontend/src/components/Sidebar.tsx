import React from "react";
import {
  Box,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useNavigate } from "react-router-dom";

type Channel = {
  username: string;
  avatarUrl: string;
  isLive: boolean;
  viewers?: number;
};

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  channels?: Channel[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, channels = [] }) => {
  const navigate = useNavigate();

  const handleChannelClick = (channel: Channel) => {
    if (channel.isLive) {
      navigate(`/watch/${channel.username}`);
    } else {
      navigate(`/channel/${channel.username}`); // Пока заглушка
    }
  };

  return (
    <Box
      sx={{height: "100%", backgroundColor: "#1f1f23", color: "white", p: 2, transition: "width 0.3s ease", overflowY: "auto", position: "sticky", top: 0}}
    >
        <Stack spacing={2} sx={{alignItems: isOpen ? "flex-start" : "center"}}>
            <IconButton onClick={onToggle} sx={{ color: "white" }}>
                <MenuIcon />
            </IconButton>
        </Stack>

        <Box mt={2}>
            {isOpen ? (
            <>
                <Typography variant="subtitle1" gutterBottom>
                Похожие каналы
                </Typography>
                <Divider sx={{ borderColor: "#444", mb: 2 }} />

                <Stack spacing={2}>
                {channels.map((channel, index) => (
                    <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleChannelClick(channel)}
                    >
                    <Avatar
                        src={channel.avatarUrl}
                        alt={channel.username}
                        sx={{ width: 32, height: 32, mr: 1 }}
                    />
                    <Box>
                        <Typography variant="body2">{channel.username}</Typography>
                        <Box display="flex" alignItems="center">
                        <FiberManualRecordIcon
                            fontSize="small"
                            sx={{ color: channel.isLive ? "red" : "#888", fontSize: 12, mr: 0.5,}}
                        />
                        <Typography variant="caption" color="gray">
                            {channel.isLive ? `${channel.viewers}` : "офлайн"}
                        </Typography>
                        </Box>
                    </Box>
                    </Box>
                ))}
                </Stack>
            </>
            ) : (
            <Stack spacing={2} mt={2} alignItems="center">
                {channels.map((channel, index) => (
                <Tooltip key={index} title={channel.username} arrow>
                    <Avatar
                    src={channel.avatarUrl}
                    alt={channel.username}
                    sx={{ width: 40, height: 40, cursor: "pointer" }}
                    onClick={() => handleChannelClick(channel)}
                    />
                </Tooltip>
                ))}
            </Stack>
            )}
        </Box>
    </Box>
  );
};

export default Sidebar;
