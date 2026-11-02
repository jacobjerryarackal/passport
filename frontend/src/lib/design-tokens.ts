/**
 * Passport Financial Control Plane Design System Tokens
 * Strict 8px baseline grid, institutional contrast ratios, zero arbitrary values.
 */

export const passportTokens = {
  meta: {
    system: "Passport Financial Control Plane (PFCP-v2)",
    gridBase: 8,
    mode: "Dark-First with High-Contrast Light Counterpart",
  },

  colors: {
    // Brand Accent (Single Accent Principle)
    brand: {
      default: "#0070BA",       // PayPal Core Blue
      hover: "#005EA6",
      active: "#00477D",
      subtle: "rgba(0, 112, 186, 0.10)",
      border: "rgba(0, 112, 186, 0.35)",
      textContrast: "#FFFFFF",
    },

    // Strictly Reserved Semantic Signals
    semantic: {
      success: {
        solid: "#10B981",       // Approved / Verified Settlement only
        subtle: "rgba(16, 185, 129, 0.08)",
        border: "rgba(16, 185, 129, 0.25)",
        text: "#34D399",
      },
      warning: {
        solid: "#F59E0B",       // Human Co-Sign / Pending Approval only
        subtle: "rgba(245, 158, 11, 0.08)",
        border: "rgba(245, 158, 11, 0.30)",
        text: "#FBBF24",
      },
      danger: {
        solid: "#EF4444",       // Mandate Blocked / Dispute Risk only
        subtle: "rgba(239, 68, 68, 0.08)",
        border: "rgba(239, 68, 68, 0.25)",
        text: "#F87171",
      },
      info: {
        solid: "#0284C7",       // Technical Metadata / System Verification
        subtle: "rgba(2, 132, 199, 0.08)",
        border: "rgba(2, 132, 199, 0.25)",
        text: "#38BDF8",
      },
    },

    // Dark Theme Foundation (Primary Mode)
    dark: {
      canvas: "#09090B",        // Obsidian Zinc (Base)
      surface: "#121215",       // Raised Card Surface
      surfaceElevated: "#18181C",// Dialogs, Popovers, Credentials
      surfaceSubtle: "#1F1F24",  // Input fills, inset blocks
      borderHairline: "#27272A",// Structural 1px division
      borderStrong: "#3F3F46",  // Interactive border
      textPrimary: "#FAFAFA",   // High-contrast primary text (98%)
      textSecondary: "#A1A1AA", // Muted explanatory labels (70%)
      textTertiary: "#71717A",  // Micro metadata, timestamps (50%)
      codeBg: "#0B0B0E",
    },

    // Light Theme Foundation (Counterpart)
    light: {
      canvas: "#F8FAFC",        // Pure Slate Base
      surface: "#FFFFFF",       // White Surface
      surfaceElevated: "#F1F5F9",
      surfaceSubtle: "#E2E8F0",
      borderHairline: "#E2E8F0",
      borderStrong: "#CBD5E1",
      textPrimary: "#09090B",
      textSecondary: "#475569",
      textTertiary: "#94A3B8",
      codeBg: "#F1F5F9",
    },
  },

  // 8px Spacing System
  spacing: {
    0: "0px",
    1: "4px",   // 0.5x
    2: "8px",   // 1x (Base Grid)
    3: "12px",  // 1.5x
    4: "16px",  // 2x
    5: "20px",  // 2.5x
    6: "24px",  // 3x
    8: "32px",  // 4x
    10: "40px", // 5x
    12: "48px", // 6x
    16: "64px", // 8x
    20: "80px", // 10x
    24: "96px", // 12x
  },

  // Restrained Radius Scale (No bulbous curves)
  radius: {
    none: "0px",
    xs: "2px",  // Technical tags
    sm: "4px",  // Badges, chips, data cells
    md: "6px",  // Buttons, inputs, dropdown items
    lg: "10px", // Standard control plane cards
    xl: "14px", // Trust Passport credential
  },

  // Elevation & Shadows (Crisp institutional depth, no muddy blur)
  shadows: {
    none: "none",
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.5)",
    credential: "0 8px 30px -4px rgba(0, 0, 0, 0.7), 0 4px 12px -2px rgba(0, 0, 0, 0.5)",
    focus: "0 0 0 2px #0070BA",
  },
};

