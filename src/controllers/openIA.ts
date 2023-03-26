import { language } from "./language";
import {getHttpError} from "./error"

interface requestGPT {
  status: boolean;
  message: string;
}

interface imgFun {
  prompt: string,
  tokenUser: string,
  codeLang: string
}



export async function requestGPT(
  prompt: string,
  tokenUser: string,
  codeLang: string,
  name: string,
  reply?: string | undefined
): Promise<requestGPT> {
  try {
    const lang = language(codeLang);
    const url = "https://api.openai.com/v1/chat/completions";
    const token = tokenUser;
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };
    const messages = [];

    messages.push({
      role: "system",
      content: `${lang.system.contex} ${lang.system.chatting} ${name}. ${lang.system.craator}`,
    });

    if (reply) {
      messages.push({
        role: "assistant",
        content: reply,
      });
    }
    messages.push({
      role: "user",
      content: prompt,
    });

    const requestBody = {
      model: "gpt-3.5-turbo",
      messages,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    const json = await response.json();

    if (response.status != 200) {
      return getHttpError(response.status, codeLang)
    }

    return {
      status: true,
      message: json.choices[0].message.content,
    };
  } catch (err) {
    return {
      status: false,
      message: "Ha surgido un error",
    };
  }
}


export async function requestImage({prompt, tokenUser, codeLang}:imgFun){
  try {

    const url = 'https://api.openai.com/v1/images/generations';
    const token = tokenUser;
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    };

    const requestBody = {
      "prompt": prompt,
      "n": 1,
      "size": "1024x1024",
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });
    if (response.status != 200) {
      return getHttpError(response.status, codeLang)
    }

    const json = await response.json()

    return {
      status: true,
      message: json.data[0].url
    };

  } catch (error) {
    return {
      status: false,
      message: "Error Generando la Imagen",
    };
  }
}
