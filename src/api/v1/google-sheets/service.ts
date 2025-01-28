import type { ParsedEnv } from "~/constants";
import { APIError } from "~/handler";
import { GoogleAuth } from "~/utils/google";

export namespace GoogleSheetsService {
  export async function getRoomInfo(
    props: ParsedEnv["googleSheets"],
  ): Promise<string> {
    const { clientEmail, privateKey, spreadsheetId, range } = props;
    const today = new Date();
    const sheetName = `${today.getMonth() + 1}月分`;

    try {
      /**
       * Error: [unenv] crypto.createSign is not implemented yet!
       * @description Cloudflare Workers with "nodejs_compat" flag cannot use node:crypto module.
       * @link https://github.com/cloudflare/workerd/issues/3172
       *
       * @todo Use "googleapis" library when the issue is resolved.
       */
      // const auth = new google.auth.GoogleAuth({
      //   credentials: {
      //     client_email: clientEmail,
      //     private_key: privateKey.replace(/\\n/g, "\n"),
      //   },
      //   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      // });
      // const sheets = google.sheets({ version: "v4", auth });
      // const response = await sheets.spreadsheets.values.get({
      //   spreadsheetId,
      //   range: `${sheetName}!${range}`,
      // });
      // return formatRoomResponse(response.data.values);

      /** @todo Temporary implementation */
      const auth = new GoogleAuth(clientEmail, privateKey);
      const accessToken = await auth.getAccessToken();

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetName}!${range}`)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data: {
        range: string;
        values: Parameters<typeof formatRoomResponse>[0];
      } = await response.json();
      return formatRoomResponse(data.values);
    } catch (err) {
      console.error(err);
      throw new APIError("Failed to fetch google sheets data", 500);
    }
  }

  function formatRoomResponse(values: string[][] | null | undefined): string {
    if (!values || values.length === 0) {
      return "情報が見つかりませんでした";
    }

    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`; // "M/D"
    const todayRow = values.find((row) => {
      const _className = row[0]; // A列に授業名
      const date = row[1]; // B列に日付
      const _dayOfWeek = row[2]; // C列に曜日
      const _room = row[3]; // D列に教室
      return date === formattedToday;
    });

    if (!todayRow) {
      return "本日の情報が見つかりませんでした";
    }

    const room = todayRow[3]; // D列に教室

    return !room
      ? "本日の教室は予約されていません"
      : `本日の教室は\`${room}\`です`;
  }
}
