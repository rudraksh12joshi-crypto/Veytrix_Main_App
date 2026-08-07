import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { RenderStyleState } from './TransitionPreviewContext';
import { normalizeMixBlendMode } from './TransitionPreviewRenderer';

interface TransitionRenderSurfaceProps {
  outgoingContent?: React.ReactNode;
  incomingContent?: React.ReactNode;
  outgoingStyle?: RenderStyleState;
  incomingStyle?: RenderStyleState;
  compositeStyle?: RenderStyleState;
  style?: ViewStyle;
}

const sanitizeStyle = (rawStyles?: React.CSSProperties | any) => {
  if (!rawStyles) return {};
  const { mixBlendMode, ...rest } = rawStyles;
  const safeMode = normalizeMixBlendMode(mixBlendMode);
  return safeMode ? { ...rest, mixBlendMode: safeMode } : rest;
};

export const TransitionRenderSurface: React.FC<TransitionRenderSurfaceProps> = ({
  outgoingContent,
  incomingContent,
  outgoingStyle,
  incomingStyle,
  compositeStyle,
  style = {}
}) => {
  const defaultOutgoing = sanitizeStyle(
    outgoingStyle ? outgoingStyle.rawStyles : { opacity: 1 }
  );

  const defaultIncoming = sanitizeStyle(
    incomingStyle ? incomingStyle.rawStyles : { opacity: 0 }
  );

  const defaultComposite = sanitizeStyle(
    compositeStyle ? compositeStyle.rawStyles : { opacity: 1 }
  );

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* Outgoing Clip A Layer */}
      <View
        pointerEvents="none"
        style={[
          styles.absoluteLayer,
          defaultOutgoing as any
        ]}
      >
        {outgoingContent || null}
      </View>

      {/* Incoming Clip B Layer */}
      <View
        pointerEvents="none"
        style={[
          styles.absoluteLayer,
          defaultIncoming as any
        ]}
      >
        {incomingContent || null}
      </View>

      {/* Composite Overlay Pass */}
      {compositeStyle && (
        <View
          pointerEvents="none"
          style={[
            styles.absoluteLayer,
            defaultComposite as any
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  absoluteLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%'
  },
  placeholderBoxA: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderTextA: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600'
  },
  placeholderBoxB: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderTextB: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600'
  }
});
