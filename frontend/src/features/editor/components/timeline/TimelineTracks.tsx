import React from "react";
import { View, StyleSheet } from "react-native";

// Vertical stack of tracks (video / audio / text / sticker / effect layers).
export function TimelineTracks() {
  return <View testID="timeline-tracks" style={styles.tracks} />;
}

const styles = StyleSheet.create({
  tracks: { flex: 1 },
});
