import { BadmintonMatchmaker } from "./badminton-matchmaker";

// Global singleton instance
let matchmakerInstance: BadmintonMatchmaker | null = null;

// Server-side configuration storage (temporary, will be overridden by client)
let serverConfig: { courts: number; randomnessLevel: number } = {
  courts: 1,
  randomnessLevel: 0.5,
};

// Default configuration
const DEFAULT_CONFIG = {
  courts: 1,
  randomnessLevel: 0.5,
};

// Get configuration from localStorage or use defaults
function getStoredConfig() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("badminton-matchmaker-config");
      if (stored) {
        const config = JSON.parse(stored);
        // Update server config when loading from localStorage
        serverConfig = {
          courts: config.courts || 1,
          randomnessLevel: config.randomnessLevel || 0.5,
        };
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
function saveConfig(config: { courts: number; randomnessLevel: number }) {
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
    matchmakerInstance = new BadmintonMatchmaker(
      config.courts,
      config.randomnessLevel
    );

    // Load data from client-side storage if available
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("badminton-matchmaker-data");
        if (stored) {
          const data = JSON.parse(stored);
          matchmakerInstance.loadFromServerData(data);
        }
      } catch (error) {
        console.warn("Failed to load matchmaker data:", error);
      }
    }
  }
  return matchmakerInstance;
}

export function resetMatchmaker(
  courts: number = 1,
  randomnessLevel: number = 0.5
): BadmintonMatchmaker {
  const config = { courts, randomnessLevel };
  saveConfig(config);
  matchmakerInstance = new BadmintonMatchmaker(courts, randomnessLevel);

  // Clear client-side data
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("badminton-matchmaker-data");
    } catch (error) {
      console.warn("Failed to clear client data:", error);
    }
  }

  return matchmakerInstance;
}

export function updateConfiguration(
  courts: number,
  randomnessLevel?: number
): void {
  const config = {
    courts,
    randomnessLevel:
      randomnessLevel !== undefined
        ? randomnessLevel
        : serverConfig.randomnessLevel,
  };
  saveConfig(config);
  if (matchmakerInstance) {
    matchmakerInstance.updateConfiguration(courts, randomnessLevel);
  } else {
    // If no instance exists, create one with the new config
    matchmakerInstance = new BadmintonMatchmaker(
      courts,
      config.randomnessLevel
    );
  }
}

export function getCurrentConfiguration() {
  return { ...serverConfig };
}

// Export functions for client-side data management
export function saveMatchmakerData(data: any) {
  // This will be called by the client-side code to save to localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("badminton-matchmaker-data", JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save matchmaker data:", error);
    }
  }
}

export function loadMatchmakerData() {
  // This will be called by the client-side code to load from localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("badminton-matchmaker-data");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load matchmaker data:", error);
    }
  }
  return null;
}
