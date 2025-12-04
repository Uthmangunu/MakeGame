export type TileType = "floor" | "wall" | "npc" | "item" | "spawn" | "door";

export interface Level {
  levelId: string;              // "level_1", "library_entrance", etc.
  levelName: string;            // "Spooky Library Entrance"
  theme: string;                // e.g. "dungeon_dark", "forest", etc.

  width: number;
  height: number;

  // 2D grid of tile codes (integers or short strings)
  // e.g. 0=floor, 1=wall, 2=ghost, 3=book, etc.
  map: number[][];

  // A lookup from tileCode to semantic tile definition
  tileset: {
    [tileCode: number]: {
      type: TileType;
      label?: string;           // "Ghost", "Book", "Door"
      npcId?: string;           // If type === "npc"
      itemId?: string;          // If type === "item"
      doorTargetLevelId?: string; // If type === "door"
      doorTargetSpawnPointId?: string; // optional
    };
  };

  // Named spawn points for player
  spawnPoints: {
    [spawnPointId: string]: {
      x: number;
      y: number;
    };
  };

  defaultSpawnPointId: string;

  // Event definitions, keyed either by tileCode or explicit eventId
  interactions: {
    [key: string]: Interaction; // "2", "book_3", etc.
  };

  // Optional narrative blurb for UI (not required for engine)
  description?: string;
}

export type TriggerType = "on_step" | "on_talk" | "on_use";

export interface Interaction {
  trigger: TriggerType;

  // Optional condition based on flags
  requirementFlag?: string;     // e.g. "has_book"
  requirementValue?: boolean;   // default true

  // Dialogue / message
  dialogue?: string;
  successDialogue?: string;
  failureDialogue?: string;

  // Effects
  message?: string;             // For simple popups
  setFlag?: string;             // e.g. "has_book"
  setFlagValue?: boolean;       // default true

  unlockDoorTileCode?: number;  // Turn tileCode from "door_closed" to "door_open"
  giveItemFlag?: string;        // Equivalent to setFlag, but semantically item
}

export interface GameMeta {
  gameId: string;
  ownerUserId: string;
  title: string;              // "The Spirit Wolf"
  summary: string;            // Short description
  createdAt: string;          // ISO timestamp

  // Linear list of levelIds in order of play
  levelOrder: string[];       // ["level_1", "level_2", "level_3"]

  // Entry point
  startLevelId: string;       // Must be in levelOrder[0] for MVP

  // Optional: global flags that might be set across levels
  initialFlags?: {
    [flagName: string]: boolean;
  };
}
