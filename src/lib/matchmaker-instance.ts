import { BadmintonMatchmaker } from "./badminton-matchmaker";

// Global singleton instance
let matchmakerInstance: BadmintonMatchmaker | null = null;

// Server-side configuration storage
let serverConfig: { courts: number } = {
  courts: 1,
};

// Default configuration
const DEFAULT_CONFIG = {
  courts: 1,
};

// Get configuration from localStorage or use defaults
function getStoredConfig() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("badminton-matchmaker-config");
      if (stored) {
        const config = JSON.parse(stored);
        // Update server config when loading from localStorage
        serverConfig = { courts: config.courts || 1 };
        return serverConfig;
      }
    } catch (error) {
      console.warn("Failed to load stored configuration:", error);
    }
  }
  // Return current server config (not default)
  return serverConfig;
}

// Save configuration to localStorage and server
function saveConfig(config: { courts: number }) {
  serverConfig = config;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "badminton-matchmaker-config",
        JSON.stringify(config)
      );
    } catch (error) {
      console.warn("Failed to save configuration:", error);
    }
  }
}

export function getMatchmaker(): BadmintonMatchmaker {
  if (!matchmakerInstance) {
    const config = getStoredConfig();
    matchmakerInstance = new BadmintonMatchmaker(config.courts);
  }
  return matchmakerInstance;
}

export function resetMatchmaker(courts: number = 1): BadmintonMatchmaker {
  const config = { courts };
  saveConfig(config);
  matchmakerInstance = new BadmintonMatchmaker(courts);
  return matchmakerInstance;
}

export function updateConfiguration(courts: number): void {
  const config = { courts };
  saveConfig(config);
  if (matchmakerInstance) {
    matchmakerInstance.updateConfiguration(courts);
  } else {
    // If no instance exists, create one with the new config
    matchmakerInstance = new BadmintonMatchmaker(courts);
  }
}

export function getCurrentConfiguration() {
  return { ...serverConfig };
}
