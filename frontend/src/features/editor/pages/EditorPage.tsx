import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/src/theme";
import { EditorTopNavigation } from "../components/top-navigation/EditorTopNavigation";
import { EditorLeftSidebar } from "../components/left-sidebar/EditorLeftSidebar";
import { EditorRightSidebar } from "../components/right-sidebar/EditorRightSidebar";
import { EditorToolbar } from "../components/toolbar/EditorToolbar";
import { EditorCanvas } from "../components/canvas/EditorCanvas";
import { EditorBottomControls } from "../components/bottom-controls/EditorBottomControls";
import { EditorPlaybackControls } from "../components/playback-controls/EditorPlaybackControls";
import { EditorTimeline } from "../components/timeline/EditorTimeline";
import { EditorPropertiesPanel } from "../components/properties-panel/EditorPropertiesPanel";

// Editor page - assembles all editor regions. No editing logic here.
export function EditorPage() {
  const { theme } = useTheme();
  return (
    <View testID="editor-page" style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <EditorTopNavigation />
      <View style={styles.middle}>
        <EditorLeftSidebar />
        <View style={styles.stage}>
          <EditorToolbar />
          <EditorCanvas />
          <EditorPlaybackControls />
          <EditorTimeline />
          <EditorBottomControls />
        </View>
        <EditorRightSidebar />
      </View>
      <EditorPropertiesPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  middle: { flex: 1, flexDirection: "row" },
  stage: { flex: 1 },
});
