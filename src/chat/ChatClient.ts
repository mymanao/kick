import type { RestClient } from "../rest/RestClient.ts";
import type { ChatMessage } from "../../types";

/**
 * ChatClient provides access to Kick Chat APIs.
 * @example
 * await kick.chat.send({
 *   content: "Hello world!"
 * });
 */
export class ChatClient {
  constructor(private rest: RestClient) {}

  /**
   * Send a message to the chat.
   * * Requires scope:
   * `chat:write`
   * @param message The message object to send
   * @returns A promise that resolves when the message is sent
   * @example
   * // Send a simple message
   * await kick.chat.send({ content: "Hello Kick!" });
   *
   */
  send(message: ChatMessage): Promise<void> {
    return this.rest.fetch("/public/v1/chat", {
      method: "POST",
      body: JSON.stringify({
        type: message.type ?? "bot",
        content: message.content,
      }),
    });
  }

  /**
   * Delete a chat message from a channel.
   *
   * * Requires scope:
   * `moderation:chat_message:manage`: Execute moderation actions on chat messages
   *
   * @param messageId Message ID
   */
  delete(messageId: string): Promise<void> {
    return this.rest.fetch(`/public/v1/chat/${messageId}`, {
      method: "DELETE",
    });
  }
}
