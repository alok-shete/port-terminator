/**
 * Custom error class for handling port-related errors.
 *
 * This error class extends the built-in JavaScript `Error` class
 * and includes additional properties for error code and name.
 *
 * @class PortError
 * @extends Error
 */
export class PortError extends Error {
  /**
   * The name of the error.
   *
   * @type {string}
   */
  name: string;

  /**
   * The error code associated with the error.
   *
   * @type {string}
   */
  code: string;

  /**
   * Creates a new instance of the `PortError` class.
   *
   * @param {string} name - The name of the error.
   * @param {string} code - The error code.
   * @param {string} message - A descriptive error message.
   */
  constructor(name: string, code: string, message: string) {
    // Call the constructor of the parent class (Error) with the provided message.
    super(message);

    // Set the name and code properties.
    this.name = name;
    this.code = code;
  }
}

/**
 * Collection of custom error functions for socket-related errors.
 *
 * This object defines error functions that can be used to create
 * instances of the `PortError` class with specific error codes and messages.
 */
export const ERRORS = {
  /**
   * Creates a `PortError` for the case when an invalid port is provided.
   *
   * @param {string | number} port - The invalid port value.
   * @returns {PortError} - The created `PortError` instance.
   */
  ERR_SOCKET_BAD_PORT: (port: string | number) => {
    return new PortError(
      "RangeError",
      "ERR_SOCKET_BAD_PORT",
      `Port should be >= 0 and < 65536. Received type number (${port}).`,
    );
  },

  /**
   * Creates a `PortError` for the case when a port is already open.
   *
   * @param {string | number} port - The port that is already open.
   * @returns {PortError} - The created `PortError` instance.
   */
  ERR_SOCKET_PORT_ALREADY_OPEN: (port: string | number) => {
    return new PortError(
      "Error",
      "ERR_SOCKET_PORT_ALREADY_OPEN",
      `No processes are currently running on port ${port}.`,
    );
  },

  /**
   * Creates a `PortError` for the case when a process on a port cannot be killed.
   *
   * @param {string | number} port - The port for which the process cannot be killed.
   * @returns {PortError} - The created `PortError` instance.
   */
  ERR_SOCKET_UNABLE_TO_KILL_PORT: (port: string | number) => {
    return new PortError(
      "Error",
      "ERR_SOCKET_UNABLE_TO_KILL_PORT",
      `Error terminating processes for port ${port}.`,
    );
  },

  /**
   * Creates a `PortError` based on a generic error.
   *
   * @param {Error} error - The generic error to create a `PortError` from.
   * @returns {PortError} - The created `PortError` instance.
   */
  DEFAULT_ERROR: (error: Error) => {
    return new PortError(error.name, "", error.message);
  },
};
