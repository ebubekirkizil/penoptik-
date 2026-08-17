// @ts-nocheck
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
