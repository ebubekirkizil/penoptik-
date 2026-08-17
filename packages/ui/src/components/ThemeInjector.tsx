// @ts-nocheck
"use client";

import React from "react";

export interface ThemeColors {
  lightPrimary?: string;
  lightSecondary?: string;
  lightBackground?: string;
  lightSurface?: string;
  lightForeground?: string;
  lightMutedForeground?: string;
  lightBorder?: string;
  lightChart1?: string;
  lightChart2?: string;
  lightWarning?: string;
  lightSuccess?: string;
  lightDanger?: string;

  lightRxUzakBg?: string; lightRxUzakBorder?: string; lightRxUzakText?: string;
  lightRxYakinBg?: string; lightRxYakinBorder?: string; lightRxYakinText?: string;
  lightRxDaimiBg?: string; lightRxDaimiBorder?: string; lightRxDaimiText?: string;
  lightRxNotesBg?: string; lightRxNotesBorder?: string; lightRxNotesText?: string;
  lightRxPdPhBg?: string; lightRxPdPhBorder?: string; lightRxPdPhText?: string;
  lightRxValueBg?: string; lightRxValueText?: string;
  
  lightAiChatBg?: string; lightAiChatText?: string; lightAiChatPrimary?: string; lightAiChatBubble?: string;

  darkPrimary?: string;
  darkSecondary?: string;
  darkBackground?: string;
  darkSurface?: string;
  darkForeground?: string;
  darkMutedForeground?: string;
  darkBorder?: string;
  darkChart1?: string;
  darkChart2?: string;
  darkWarning?: string;
  darkSuccess?: string;
  darkDanger?: string;

  darkRxUzakBg?: string; darkRxUzakBorder?: string; darkRxUzakText?: string;
  darkRxYakinBg?: string; darkRxYakinBorder?: string; darkRxYakinText?: string;
  darkRxDaimiBg?: string; darkRxDaimiBorder?: string; darkRxDaimiText?: string;
  darkRxNotesBg?: string; darkRxNotesBorder?: string; darkRxNotesText?: string;
  darkRxPdPhBg?: string; darkRxPdPhBorder?: string; darkRxPdPhText?: string;
  darkRxValueBg?: string; darkRxValueText?: string;
  
  darkAiChatBg?: string; darkAiChatText?: string; darkAiChatPrimary?: string; darkAiChatBubble?: string;
}

export default function ThemeInjector({ theme }: { theme?: ThemeColors }) {
  if (!theme) return null;

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        :root {
          ${theme.lightPrimary ? `--primary: ${theme.lightPrimary};` : ''}
          ${theme.lightSecondary ? `--secondary: ${theme.lightSecondary};` : ''}
          ${theme.lightBackground ? `--background: ${theme.lightBackground};` : ''}
          ${theme.lightSurface ? `--surface: ${theme.lightSurface};` : ''}
          ${theme.lightForeground ? `--foreground: ${theme.lightForeground};` : ''}
          ${theme.lightMutedForeground ? `--muted-foreground: ${theme.lightMutedForeground};` : ''}
          ${theme.lightBorder ? `--border-color: ${theme.lightBorder};` : ''}
          ${theme.lightChart1 ? `--chart-1: ${theme.lightChart1};` : ''}
          ${theme.lightChart2 ? `--chart-2: ${theme.lightChart2};` : ''}
          ${theme.lightWarning ? `--warning: ${theme.lightWarning};` : ''}
          ${theme.lightSuccess ? `--success: ${theme.lightSuccess};` : ''}
          ${theme.lightDanger ? `--danger: ${theme.lightDanger};` : ''}
          
          ${theme.lightRxUzakBg ? `--rx-uzak-bg: ${theme.lightRxUzakBg};` : ''}
          ${theme.lightRxUzakBorder ? `--rx-uzak-border: ${theme.lightRxUzakBorder};` : ''}
          ${theme.lightRxUzakText ? `--rx-uzak-text: ${theme.lightRxUzakText};` : ''}
          ${theme.lightRxYakinBg ? `--rx-yakin-bg: ${theme.lightRxYakinBg};` : ''}
          ${theme.lightRxYakinBorder ? `--rx-yakin-border: ${theme.lightRxYakinBorder};` : ''}
          ${theme.lightRxYakinText ? `--rx-yakin-text: ${theme.lightRxYakinText};` : ''}
          ${theme.lightRxDaimiBg ? `--rx-daimi-bg: ${theme.lightRxDaimiBg};` : ''}
          ${theme.lightRxDaimiBorder ? `--rx-daimi-border: ${theme.lightRxDaimiBorder};` : ''}
          ${theme.lightRxDaimiText ? `--rx-daimi-text: ${theme.lightRxDaimiText};` : ''}
          ${theme.lightRxNotesBg ? `--rx-notes-bg: ${theme.lightRxNotesBg};` : ''}
          ${theme.lightRxNotesBorder ? `--rx-notes-border: ${theme.lightRxNotesBorder};` : ''}
          ${theme.lightRxNotesText ? `--rx-notes-text: ${theme.lightRxNotesText};` : ''}
          ${theme.lightRxPdPhBg ? `--rx-pdph-bg: ${theme.lightRxPdPhBg};` : ''}
          ${theme.lightRxPdPhBorder ? `--rx-pdph-border: ${theme.lightRxPdPhBorder};` : ''}
          ${theme.lightRxPdPhText ? `--rx-pdph-text: ${theme.lightRxPdPhText};` : ''}
          ${theme.lightRxValueBg ? `--rx-value-bg: ${theme.lightRxValueBg};` : ''}
          ${theme.lightRxValueText ? `--rx-value-text: ${theme.lightRxValueText};` : ''}
          
          ${theme.lightAiChatBg ? `--ai-chat-bg: ${theme.lightAiChatBg};` : ''}
          ${theme.lightAiChatText ? `--ai-chat-text: ${theme.lightAiChatText};` : ''}
          ${theme.lightAiChatPrimary ? `--ai-chat-primary: ${theme.lightAiChatPrimary};` : ''}
          ${theme.lightAiChatBubble ? `--ai-chat-bubble: ${theme.lightAiChatBubble};` : ''}
        }
        .dark {
          ${theme.darkPrimary ? `--primary: ${theme.darkPrimary};` : ''}
          ${theme.darkSecondary ? `--secondary: ${theme.darkSecondary};` : ''}
          ${theme.darkBackground ? `--background: ${theme.darkBackground};` : ''}
          ${theme.darkSurface ? `--surface: ${theme.darkSurface};` : ''}
          ${theme.darkForeground ? `--foreground: ${theme.darkForeground};` : ''}
          ${theme.darkMutedForeground ? `--muted-foreground: ${theme.darkMutedForeground};` : ''}
          ${theme.darkBorder ? `--border-color: ${theme.darkBorder};` : ''}
          ${theme.darkChart1 ? `--chart-1: ${theme.darkChart1};` : ''}
          ${theme.darkChart2 ? `--chart-2: ${theme.darkChart2};` : ''}
          ${theme.darkWarning ? `--warning: ${theme.darkWarning};` : ''}
          ${theme.darkSuccess ? `--success: ${theme.darkSuccess};` : ''}
          ${theme.darkDanger ? `--danger: ${theme.darkDanger};` : ''}
          
          ${theme.darkRxUzakBg ? `--rx-uzak-bg: ${theme.darkRxUzakBg};` : ''}
          ${theme.darkRxUzakBorder ? `--rx-uzak-border: ${theme.darkRxUzakBorder};` : ''}
          ${theme.darkRxUzakText ? `--rx-uzak-text: ${theme.darkRxUzakText};` : ''}
          ${theme.darkRxYakinBg ? `--rx-yakin-bg: ${theme.darkRxYakinBg};` : ''}
          ${theme.darkRxYakinBorder ? `--rx-yakin-border: ${theme.darkRxYakinBorder};` : ''}
          ${theme.darkRxYakinText ? `--rx-yakin-text: ${theme.darkRxYakinText};` : ''}
          ${theme.darkRxDaimiBg ? `--rx-daimi-bg: ${theme.darkRxDaimiBg};` : ''}
          ${theme.darkRxDaimiBorder ? `--rx-daimi-border: ${theme.darkRxDaimiBorder};` : ''}
          ${theme.darkRxDaimiText ? `--rx-daimi-text: ${theme.darkRxDaimiText};` : ''}
          ${theme.darkRxNotesBg ? `--rx-notes-bg: ${theme.darkRxNotesBg};` : ''}
          ${theme.darkRxNotesBorder ? `--rx-notes-border: ${theme.darkRxNotesBorder};` : ''}
          ${theme.darkRxNotesText ? `--rx-notes-text: ${theme.darkRxNotesText};` : ''}
          ${theme.darkRxPdPhBg ? `--rx-pdph-bg: ${theme.darkRxPdPhBg};` : ''}
          ${theme.darkRxPdPhBorder ? `--rx-pdph-border: ${theme.darkRxPdPhBorder};` : ''}
          ${theme.darkRxPdPhText ? `--rx-pdph-text: ${theme.darkRxPdPhText};` : ''}
          ${theme.darkRxValueBg ? `--rx-value-bg: ${theme.darkRxValueBg};` : ''}
          ${theme.darkRxValueText ? `--rx-value-text: ${theme.darkRxValueText};` : ''}
          
          ${theme.darkAiChatBg ? `--ai-chat-bg: ${theme.darkAiChatBg};` : ''}
          ${theme.darkAiChatText ? `--ai-chat-text: ${theme.darkAiChatText};` : ''}
          ${theme.darkAiChatPrimary ? `--ai-chat-primary: ${theme.darkAiChatPrimary};` : ''}
          ${theme.darkAiChatBubble ? `--ai-chat-bubble: ${theme.darkAiChatBubble};` : ''}
        }
      `
    }} />
  );
}
