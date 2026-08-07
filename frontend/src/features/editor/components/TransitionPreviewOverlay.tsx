import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { VideoClip } from '../types/editor.types';
import { TransitionPair } from '../panels/TransitionPanel';
import { TransitionPreviewController, TransitionRenderSurface, PreviewFrameState } from '../transitions/preview';

interface TransitionPreviewOverlayProps {
  selectedTransitionPair: TransitionPair | null;
  allTransitionPairs: TransitionPair[];
  videoClips: VideoClip[];
  isPlaying: boolean;
  previewMuted: boolean;
  videoUri?: string;
}

const isImageUri = (uri?: string, mediaType?: string): boolean => {
  if (!uri) return false;
  if (mediaType === 'image') return true;
  const lower = uri.toLowerCase();
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif') ||
    lower.startsWith('data:image/')
  );
};

export const TransitionPreviewOverlay: React.FC<TransitionPreviewOverlayProps> = ({
  selectedTransitionPair,
  allTransitionPairs,
  videoClips,
  isPlaying,
  previewMuted,
  videoUri,
}) => {
  const [activeFrame, setActiveFrame] = useState<PreviewFrameState | null>(null);

  useEffect(() => {
    const controller = TransitionPreviewController.getInstance();
    const unsubscribe = controller.subscribe((frameState) => {
      setActiveFrame(frameState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!activeFrame) {
    return null;
  }

  const pair = selectedTransitionPair || allTransitionPairs[0];
  const clipA = videoClips.find((c) => c.id === pair?.fromId) || videoClips[0];
  const clipB = videoClips.find((c) => c.id === pair?.toId) || videoClips[1] || videoClips[0];

  const renderMedia = (clip?: VideoClip) => {
    if (!clip || !clip.videoUri) return null;
    if (isImageUri(clip.videoUri, clip.mediaType)) {
      return (
        <Image
          source={{ uri: clip.videoUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
      );
    }
    return (
      <Video
        source={{ uri: clip.videoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isPlaying}
        isMuted={previewMuted || Boolean(clip?.audio?.muted)}
      />
    );
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <TransitionRenderSurface
        outgoingContent={renderMedia(clipA)}
        incomingContent={renderMedia(clipB)}
        outgoingStyle={activeFrame.outgoingClipStyle}
        incomingStyle={activeFrame.incomingClipStyle}
        compositeStyle={activeFrame.compositeStyle}
      />
    </View>
  );
};
