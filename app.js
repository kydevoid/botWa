import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import "dotenv/config";
import geminiAI from "./libs/geminiAi";

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    console.log(JSON.stringify(m, undefined, 2));

    if (m.messages[0].message.conversation.startsWith("/zakyai")) {
      const param = m.messages[0].message.conversation
        .split("/zakyai")[1]
        .trim();
      console.log(param);
      const geminiRes = await geminiAI(param);
      console.log("replying to", m.messages[0].key.remoteJid);
      await sock.sendMessage(m.messages[0].key.remoteJid, {
        text: geminiRes,
      });
    }
  });
};

// run in main file
connectToWhatsApp();
