import es from "../../locale/es.json";
import en from "../../locale/en.json";

export function language(language:string){
   return  language === "es" ? es : en;
}