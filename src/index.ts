import { Telegraf } from "telegraf";
import { requestGPT } from "./controllers/openIA";
import { db } from "./firebase";
import { language } from "./controllers/language";

require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN as string);

interface userData {
  id: number;
  username?: string;
  date: Date;
  firstName: string;
  lastName?: string;
  token: string;
}

bot.start(async (ctx) => {
  const languageChat = ctx.message.from.language_code;
  const lang = language(languageChat ? languageChat : "en");
  const text = `${lang.start.a}
${lang.start.b}
${lang.start.c}
${lang.start.d}
${lang.start.e} ${lang.start.f}
${lang.start.g} ${lang.start.h}
        `;
  ctx.reply(text, { parse_mode: "Markdown" });
});

bot.command("token", async (ctx) => {
  const languageChat = ctx.message.from.language_code;
  const lang = language(languageChat ? languageChat : "en");
  const id = ctx.message.from.id;
  const token = ctx.message.text.split("token")[1];
  if (!token) {
    return ctx.reply(
      `${lang.token.enter}

${lang.token.example}`,
      { parse_mode: "Markdown" }
    );
  }
  const user = await db.collection("users").doc(id.toString()).get();
  if (user.exists) {
    await db.collection("users").doc(id.toString()).update({ token: token });
    return ctx.reply(lang.token.updated);
  }

  const date = new Date();

  const body: userData = {
    id,
    username: ctx.message.from.username,
    date,
    firstName: ctx.message.from.first_name,
    lastName: ctx.message.from.last_name ? ctx.message.from.last_name : "",
    token,
  };

  await db.collection("users").doc(id.toString()).create(body);
  ctx.reply(lang.token.created);
});

bot.on("text", async (ctx) => {
  const languageChat = ctx.message.from.language_code;
  const codeLang = languageChat === "es" ? languageChat : "en";
  const lang = language(codeLang);

  const id = ctx.message.from.id;
  const user = await db.collection("users").doc(id.toString()).get();

  if (!user.exists) {
    ctx.reply(
      "El usuario no esta registrado, por favor registre el token con /addToken"
    );
    return;
  }

  await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  const reply: string | undefined = ctx.message.reply_to_message
    ? (ctx.message.reply_to_message.text as string)
    : undefined;
  const userData = user.data() as userData;
  const text = ctx.message.text;
  const name = ctx.message.from.first_name + " " + ctx.message.from.last_name;

  const response = await requestGPT(
    text,
    userData.token,
    codeLang,
    name,
    reply
  );

  if (!response.status) {
    ctx.reply(
      "No puedo responder por el momento, verifique el token antes de continuar"
    );
    return;
  }
  ctx.reply(response.message, { parse_mode: "Markdown" });
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
