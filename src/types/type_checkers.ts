// deno-lint-ignore-file no-explicit-any
import { checkObject } from "./type_util.ts";
import {
  APIAdmin,
  APIVersion,
  AvailableGameSystem,
  CommandResult,
  DiceRoll,
  GameSystem,
  OriginalTableResults,
} from "./types.ts";

export function isAPIVersion(
  arg: any,
): arg is APIVersion {
  return checkObject<APIVersion>(arg, {
    api: "string",
    bcdice: "string",
  });
}

export function isAPIAdmin(
  arg: any,
): arg is APIAdmin {
  return checkObject<APIAdmin>(arg, {
    name: "string",
    url: "string",
    email: "string",
  });
}

export function isAvailableGameSystem(
  arg: any,
): arg is AvailableGameSystem {
  return checkObject<AvailableGameSystem>(arg, {
    id: "string",
    name: "string",
    sortKey: "string",
  });
}

export function isDiceRoll(
  arg: any,
): arg is DiceRoll {
  return checkObject<DiceRoll>(arg, {
    kind: "string",
    sides: "number",
    value: "number",
  });
}

export function isCommandResult(
  arg: any,
): arg is CommandResult {
  if (
    !(checkObject<CommandResult>(arg, {
      text: "string",
      secret: "boolean",
      success: "boolean",
      failure: "boolean",
      critical: "boolean",
      fumble: "boolean",
      rands: "object",
    }))
  ) {
    return false;
  }

  if (!Array.isArray(arg.rands)) return false;

  let isSuccessRandsCheck = true;

  arg.rands.forEach((rand) => {
    if (!isSuccessRandsCheck) return;
    isSuccessRandsCheck = isDiceRoll(rand);
  });

  return isSuccessRandsCheck;
}

export function isGameSystem(arg: any): arg is GameSystem {
  if (
    !(checkObject<GameSystem>(arg, {
      id: "string",
      name: "string",
      sortKey: "string",
      commandPattern: "object",
      helpMessage: "string",
    }))
  ) {
    return false;
  }

  return arg.commandPattern instanceof RegExp;
}

export function isOriginalTableResults(arg: any): arg is OriginalTableResults {
  if (
    !checkObject<OriginalTableResults>(arg, {
      text: "string",
      rands: "object",
    })
  ) {
    return false;
  }

  if (!Array.isArray(arg.rands)) return false;

  let isSuccessRandsCheck = true;

  arg.rands.forEach((rand) => {
    if (!isSuccessRandsCheck) return;
    isSuccessRandsCheck = isDiceRoll(rand);
  });

  return isSuccessRandsCheck;
}
