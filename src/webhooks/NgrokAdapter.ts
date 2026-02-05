import { logger } from "../Logger.ts";

type NgrokOptions = {
  port?: number;
  path?: string;
  authtoken?: string;
  domain?: string;
  region?: string;
  onUrl?: (url: string) => void;
};

export async function ngrokAdapter(options: NgrokOptions = {}) {
  let ngrok: any;

  try {
    ngrok = await import("@ngrok/ngrok");
  } catch {
    throw new Error(
      "@ngrok/ngrok is not installed. Install it with `npm install @ngrok/ngrok`.",
    );
  }

  const port = options.port ?? 3000;
  const path = options.path ?? "/kick/webhook";

  const listener = await ngrok.connect({
    addr: port,
    domain: options.domain,
    region: options.region,
    authtoken: options.authtoken,
    authtoken_from_env: !options.authtoken,
  });

  const fullUrl = `${listener.url()}${path}`;

  options.onUrl?.(fullUrl);

  logger.success("Ngrok tunnel established", { fullUrl });

  return {
    url: fullUrl,
    async close() {
      await listener.close();
    },
  };
}
