import { z } from "../deps.ts";

export const APIVersion = z.object({
  api: z.string(),
  bcdice: z.string(),
}).strict();

export type APIVersion = z.infer<typeof APIVersion>;

export const APIAdmin = z.object({
  name: z.string(),
  url: z.string().url(),
  email: z.string().email(),
}).strict();

export type APIAdmin = z.infer<typeof APIAdmin>;

export const GameSystemID = z.string().regex(/^[a-zA-Z0-9]*$/);

export type GameSystemID = z.infer<typeof GameSystemID>;

export const AvailableGameSystem = z.object({
  id: GameSystemID,
  name: z.string(),
  sortKey: z.string(),
}).strict();

export type AvailableGameSystem = z.infer<typeof AvailableGameSystem>;

export const GameSystem = z.object({
  id: GameSystemID,
  name: z.string(),
  sortKey: z.string(),
  commandPattern: z.instanceof(RegExp),
  helpMessage: z.string(),
}).strict();

export type GameSystem = z.infer<typeof GameSystem>;

export const DiceKind = z.union(
  [
    z.literal("normal"),
    z.literal("tens_10d"),
    z.literal("d9"),
  ],
);

export type DiceKind = z.infer<typeof DiceKind>;

export const DiceRoll = z.object({
  kind: DiceKind,
  sides: z.number(),
  value: z.number(),
}).strict();

export type DiceRoll = z.infer<typeof DiceRoll>;

export const CommandResult = z.object({
  text: z.string(),
  secret: z.boolean(),
  success: z.boolean(),
  failure: z.boolean(),
  critical: z.boolean(),
  fumble: z.boolean(),
  rands: DiceRoll.array(),
}).strict();

export type CommandResult = z.infer<typeof CommandResult>;

export const OriginalTableResults = z.object({
  text: z.string(),
  rands: DiceRoll.array(),
}).strict();

export type OriginalTableResults = z.infer<typeof OriginalTableResults>;
