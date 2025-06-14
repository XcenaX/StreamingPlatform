import React, { MutableRefObject, useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from 'video.js/dist/types/player';
import "video.js/dist/video-js.css";
import { Box, Chip } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface TwitchStylePlayerProps {
  src: string;
  isLive: boolean;
  playerRef: MutableRefObject<VideoJsPlayer | null>;
}

export default function TwitchStylePlayer({ src, isLive, playerRef  }: TwitchStylePlayerProps) {
  const videoNode = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoNode.current && !playerRef.current) {
      const options: any = {
        controlBar: {
          skipButtons: null,
          progressBar: false,
        },
        autoplay: true,
        controls: true,
        userActions: { hotkeys: true },
        usingNativeControls: true,
        responsive: true,
        playbackRates: [0.5, 1, 1.25, 1.5, 2, 3],
        fluid: true,
        preload: "metadata",
        liveui: isLive,
        liveTracker: {
          trackingThreshold: 5,
        },
        errorDisplay: false,
        sources: [
          {
            src,
            type: "application/x-mpegURL",
          },
        ],
      };

      if (!isLive) {
        options.controlBar.skipButtons = {
          forward: 10,
          backward: 10,
        };
        options.controlBar.progressBar = true;
      }

      const player = videojs(videoNode.current, options);
      playerRef.current = player;

      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }
  }, [src, isLive]);

  return (
    <Box sx={{ position: "relative", height: "100%" }}>
      <div data-vjs-player>
        <video ref={videoNode} className="video-js" />
      </div>

      <Chip
        icon={
          <FiberManualRecordIcon
            sx={{ color: isLive ? "white" : "#aaa", fontSize: 14 }}
          />
        }
        label={isLive ? "LIVE" : "VOD"}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          backgroundColor: isLive ? "red" : "#555",
          color: "white",
          fontWeight: "bold",
          fontSize: "0.75rem",
          letterSpacing: 1,
          borderRadius: 1,
          pl: 1,
          zIndex: 10,
        }}
      />
    </Box>
  );
}
