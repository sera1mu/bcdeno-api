/**
 * BCDiceとBCDice-APIのバージョン
 */
export interface APIVersion {
  /**
   * BCDice-APIのバージョン
   */
  api: string;

  /**
   * BCDice自体のバージョン
   */
  bcdice: string;
}

/**
 * BCDice-API の管理者情報
 */
export interface APIAdmin {
  /**
   * 管理者名
   */
  name: string;

  /**
   * 利用規約のURL
   */
  url: string;

  /**
   * 管理者のメールアドレス
   */
  email: string;
}

/**
 * 使用可能なゲームシステム
 */
export interface AvailableGameSystem {
  id: string;

  name: string;

  /**
   * ゲームシステム名をソートするためのキー
   */
  sortKey: string;
}

export interface GameSystem {
  id: string;

  name: string;

  /**
   * ゲームシステム名をソートするためのキー
   */
  sortKey: string;

  /**
   * 指定されたコマンドがこのゲームシステムで実行可能かをチェックするための正規表現
   */
  commandPattern: RegExp;

  /**
   * 使い方などの追加情報
   */
  helpMessage: string;
}

/**
 * ダイスロールの種類と結果
 */
export interface DiceRoll {
  /**
   * 振ったダイスの種類
   */
  kind: "normal" | "tens_d10" | "d9";

  /**
   * 存在するダイスの面の数
   */
  sides: number;

  /**
   * ダイスの出目
   */
  value: number;
}

/**
 * コマンドの実行結果
 */
export interface CommandResult {
  /**
   * コマンドの実行結果
   */
  text: string;

  /**
   * このダイスがシークレットダイスか否か
   */
  secret: boolean;

  /**
   * このコマンドが成功したか否か
   */
  success: boolean;

  /**
   * このコマンドが失敗したか否か
   */
  failure: boolean;

  /**
   * このコマンドがクリティカル(決定的成功)か否か
   */
  critical: boolean;

  /**
   * このコマンドがファンブル(致命的失敗)か否か
   */
  fumble: boolean;

  /**
   * 実際に振られたダイス
   */
  rands: DiceRoll[];
}

/**
 * オリジナル表の実行結果
 */
export interface OriginalTableResults {
  /**
   * 実行結果
   */
  text: string;

  /**
   * 実際に振られたダイス
   */
  rands: DiceRoll[];
}
