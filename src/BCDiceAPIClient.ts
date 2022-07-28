import { HTTPError, Options } from "ky";
import BCDiceOriginalTable from "./BCDiceOriginalTable.ts";
import BCDiceError from "./BCDiceError.ts";
import {
  APIAdmin,
  APIVersion,
  AvailableGameSystem,
  CommandResult,
  GameSystem,
  OriginalTableResults,
} from "./types/types.ts";
import {
  isAPIAdmin,
  isAPIVersion,
  isAvailableGameSystem,
  isCommandResult,
  isGameSystem,
  isOriginalTableResults,
} from "./types/type_checkers.ts";
import WebClient from "./WebClient.ts";

/**
 * BCDice-APIと通信するためのクライアント
 */
export default class BCDiceAPIClient {
  readonly prefixUrl: string | URL;

  private readonly webClient: WebClient;

  constructor(webClient: WebClient) {
    this.webClient = webClient;
    this.prefixUrl = webClient.prefixUrl;
  }

  /**
   * WebClientからGETリクエストを送信し、エラー時にBCDiceErrorをthrowする
   */
  // deno-lint-ignore no-explicit-any
  private async get(path: string, options?: Options): Promise<any> {
    return await this.webClient.get(path, options)
      .catch((err) => {
        throw new BCDiceError(
          "CONNECTION_ERROR",
          "Failed to communicate with API.",
          {
            cause: err,
          },
        );
      });
  }

  private checkType(result: boolean, target: unknown): void {
    if (!result) {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        `The syntax of the response is incorrect:\n${String(target)}`,
      );
    }
  }

  /**
   * BCDiceとBCDice-API自身のバージョンを取得
   */
  async getAPIVersion(): Promise<APIVersion> {
    const json = await this.get("v2/version");
    this.checkType(isAPIVersion(json), json);
    return json;
  }

  /**
   * BCDice-APIの管理者情報を取得する
   */
  async getAPIAdmin(): Promise<APIAdmin> {
    const json = await this.get("v2/admin");
    this.checkType(isAPIAdmin(json), json);
    return json;
  }

  /**
   * 使用可能なゲームシステムを取得する
   */
  async getAvailableGameSystems(): Promise<AvailableGameSystem[]> {
    // Get data
    const json = await this.get("v2/game_system");

    if (typeof json.game_system === "undefined") {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        `The syntax of the response is incorrect. Property game_system is undefined:\n${
          JSON.stringify(json)
        }`,
      );
    }

    // すべてのゲームシステムが正しいことを確認
    for (const entry of json.game_system) {
      const newEntry = entry;

      newEntry.sortKey = newEntry.sort_key;
      delete newEntry.sort_key;

      if (!isAvailableGameSystem(entry)) {
        const causeError = new TypeError(
          `The syntax of the game system is incorrect:\n${
            JSON.stringify(entry)
          }`,
        );

        throw new BCDiceError(
          "INCORRECT_RESPONSE",
          "The game system is incorrect.",
          { cause: causeError },
        );
      }
    }

    return json.game_system;
  }

  /**
   * 指定されたゲームシステムの情報を取得する
   */
  async getGameSystem(id: string): Promise<GameSystem> {
    const json = await this.get(`v2/game_system/${id}`)
      .catch((err) => {
        // 400 Bad Request はゲームシステムのIDが正しくないことを示している
        if (
          err instanceof BCDiceError && err.cause instanceof HTTPError &&
          err.cause.response.status === 400
        ) {
          throw new BCDiceError(
            "UNSUPPORTED_SYSTEM",
            "The specified game system is unsupported.",
            { cause: err },
          );
        }

        throw err;
      });

    delete json.ok;

    if (typeof json.command_pattern === "undefined") {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        `The syntax of the response is incorrect. Property command_pattern is undefined:\n${
          JSON.stringify(json)
        }`,
      );
    }

    try {
      json.commandPattern = new RegExp(json.command_pattern);
    } catch (err) {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        "The response is incorrect.",
        { cause: err },
      );
    }

    json.sortKey = json.sort_key;
    json.helpMessage = json.help_message;

    delete json.command_pattern;
    delete json.sort_key;
    delete json.help_message;

    this.checkType(isGameSystem(json), json);

    return json;
  }

  /**
   * ダイスを振る
   * @param id ゲームシステムのID
   * @param command ダイスロールのコマンド
   */
  async diceRoll(id: string, command: string): Promise<CommandResult> {
    const json = await this.get(`v2/game_system/${id}/roll`, {
      searchParams: {
        command,
      },
    }).catch(async (err) => {
      // 400 Bad Request はコマンドが正しくないか、ゲームシステムのIDが正しくないことを示している
      if (
        err instanceof BCDiceError && err.cause instanceof HTTPError &&
        err.cause.response.status === 400
      ) {
        const json = await err.cause.response.json();

        switch (json.reason) {
          case "unsupported game system":
            throw new BCDiceError(
              "UNSUPPORTED_SYSTEM",
              "The specified game system is unsupported.",
              { cause: err },
            );

          case "unsupported command":
            throw new BCDiceError(
              "UNSUPPORTED_COMMAND",
              "The specified command is unsupported.",
              { cause: err },
            );
        }
      }

      throw err;
    });

    delete json.ok;

    this.checkType(isCommandResult(json), json);

    return json;
  }

  /**
   * BCDiceのオリジナル表を実行する
   * 詳しくは https://docs.bcdice.org/original_table.html を参照。
   */
  async runOriginalTable(
    table: BCDiceOriginalTable | string,
  ): Promise<OriginalTableResults> {
    const parsedTable = typeof table === "string"
      ? table
      : table.toBCDiceText();

    const json = await this.webClient.post("v2/original_table", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `table=${parsedTable}`,
    }).catch((err) => {
      // 500 Internal Server Error はテーブルが正しくないことを示している
      if (err instanceof HTTPError && err.response.status === 500) {
        throw new BCDiceError(
          "UNSUPPORTED_TABLE",
          "The specified table is unsupported.",
          { cause: err },
        );
      }

      throw new BCDiceError(
        "CONNECTION_ERROR",
        "Failed to communicate with API.",
        { cause: err },
      );
    });

    delete json.ok;

    this.checkType(isOriginalTableResults(json), json);

    return json;
  }
}
