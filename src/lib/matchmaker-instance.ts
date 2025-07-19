import fs from "fs";
import path from "path";
import { BadmintonMatchmaker } from "./badminton-matchmaker";

// Global singleton instance
let matchmakerInstance: BadmintonMatchmaker | null = null;

// Server-side configuration storage
let serverConfig: { courts: number; randomnessLevel: number } = {
  courts: 1,
  randomnessLevel: 0.5,
};

// Default configuration
const DEFAULT_CONFIG = {
  courts: 1,
  randomnessLevel: 0.5,
};

// Data file path for server-side persistence
const DATA_FILE_PATH = path.join(process.cwd(), "data", "matchmaker-data.json");

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Load data from server-side file
function loadServerData() {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
      return data;
    }
  } catch (error) {
    console.warn("Failed to load server data:", error);
  }
  return null;
}

// Save data to server-side file
function saveServerData(data: any) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn("Failed to save server data:", error);
  }
}

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

    // Load server-side data if available
    const serverData = loadServerData();
    if (serverData) {
      matchmakerInstance.loadFromServerData(serverData);
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

  // Clear server-side data
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      fs.unlinkSync(DATA_FILE_PATH);
    }
  } catch (error) {
    console.warn("Failed to clear server data:", error);
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

// Export functions for server-side data management
export function saveMatchmakerData(data: any) {
  saveServerData(data);
}

export function loadMatchmakerData() {
  return loadServerData();
}
