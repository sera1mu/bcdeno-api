import { HTTPError, Options, z } from "../deps.ts";
import { BCDiceOriginalTable } from "./BCDiceOriginalTable.ts";
import { BCDiceError } from "./BCDiceError.ts";
import {
  APIAdmin,
  APIVersion,
  AvailableGameSystem,
  CommandResult,
  GameSystem,
  OriginalTableResults,
} from "./types.ts";
import { WebClient } from "./WebClient.ts";

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
   * サーバーURLからBCDiceWebClientのインスタンスを作成する
   */
  static create(prefixUrl: string): BCDiceAPIClient {
    return new BCDiceAPIClient(new WebClient(prefixUrl));
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

  /**
   * resultがfalseだった場合に、コード `INCORRECT_RESPONSE` の BCDiceErrorをthrowする
   * @param result 型チェック結果
   * @param target 型チェック対象 (エラーメッセージに使用される)
   * @param targetName 型チェック対象の名前 (エラーメッセージに使用される)
   */
  private checkType(
    result: boolean,
    target: unknown,
    targetName = "the response",
  ): void {
    if (!result) {
      throw new BCDiceError(
        "INCORRECT_RESPONSE",
        `The syntax of ${targetName} is incorrect:\n${String(target)}`,
      );
    }
  }

  /**
   * BCDiceとBCDice-API自身のバージョンを取得
   */
  async getAPIVersion(): Promise<APIVersion> {
    const json = APIVersion.parse(await this.get("v2/version"));
    return json;
  }

  /**
   * BCDice-APIの管理者情報を取得する
   */
  async getAPIAdmin(): Promise<APIAdmin> {
    const json = APIAdmin.parse(await this.get("v2/admin"));
    return json;
  }

  /**
   * 使用可能なゲームシステムを取得する
   */
  async getAvailableGameSystems(): Promise<AvailableGameSystem[]> {
    const json = await this.get("v2/game_system");

    this.checkType(typeof json.game_system !== "undefined", json);

    // すべてのゲームシステムが正しいことを確認
    for (const entry of json.game_system) {
      entry.sortKey = entry.sort_key;
      delete entry.sort_key;
    }

    const gameSystems = z.array(AvailableGameSystem).parse(json.game_system);

    return gameSystems;
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

    this.checkType(typeof json.command_pattern !== "undefined", json);

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

    const gameSystem = GameSystem.parse(json);

    return gameSystem;
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

        throw new BCDiceError(
          `UNSUPPORTED_${
            json.reason === "unsupported game system" ? "SYSTEM" : "COMMAND"
          }`,
          `The specified ${
            json.reason === "unsupported game system"
              ? "game system"
              : "command"
          } is unsupported.`,
          {
            cause: err,
          },
        );
      }

      throw err;
    });

    delete json.ok;

    const commandResult = CommandResult.parse(json);

    return commandResult;
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

    const originalTableResults = OriginalTableResults.parse(json);

    return originalTableResults;
  }
}
