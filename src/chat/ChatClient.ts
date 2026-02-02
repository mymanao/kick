import type {RestClient} from "../rest/RestClient.ts";
import type {ChatMessage} from "../../types";

export class ChatClient {
  constructor(private rest: RestClient) {
  }

  send(message: ChatMessage): Promise<void> {
    return this.rest.fetch("/public/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        type: message.type ?? "bot",
        content: message.content,
      }),
    });
  }
}