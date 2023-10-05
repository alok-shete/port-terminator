export class PortError extends Error {
  // code: string;
  constructor(name: string, code: string, message: string) {
    super(message);
    this.name = name;
    // this.code = code;
  }
}

export const ERRORS = {
  ERR_SOCKET_BAD_PORT: (port: string | number) => {
    return new PortError(
      "RangeError",
      "ERR_SOCKET_BAD_PORT",
      `Port should be >= 0 and < 65536. Received type number (${port}).`,
    );
  },
  

  ERR_SOCKET_PORT_ALREADY_OPEN: (port: string | number) => {
    return new PortError("Error", "ERR_SOCKET_PORT_ALREADY_OPEN", `Port ${port} is already open.`);
  },

  ERR_SOCKET_UNABLE_TO_KILL_PORT: (port: string | number) => {
    return new PortError("Error", "ERR_SOCKET_UNABLE_TO_KILL_PORT", `Unable to kill process on port ${port}.`);
  },

  DEFAULT_ERROR: (error: Error) => {
    return new PortError(error.name, "", error.message);
  },
};
