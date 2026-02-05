let createConsola: any;
export let logger: any;

export function silent() {
  if (createConsola) {
    logger = createConsola({ level: -1 });
  }
}

try {
  createConsola = (await import("consola")).createConsola;

  logger = createConsola({
    level: process.env.LOG_LEVEL
      ? parseInt(process.env.LOG_LEVEL, 10)
      : undefined,
    defaults: {
      tag: "@manao/kick",
    },
    fancy: true,
  });
} catch {
  createConsola = null;
  logger = console;
}
