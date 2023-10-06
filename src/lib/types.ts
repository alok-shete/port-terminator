import { PortError } from "./portError";
/**
 * Represents the response of a port terminator operation.
 *
 * This type includes information about the status of the operation,
 * an optional value (typically `void`), and an optional `PortError` if
 * an error occurred during the operation.
 */
export type PORT_TERMINATOR_RESPONSE = {
  /**
   * Indicates the status of the port terminator operation.
   *
   * - `true` if the operation was successful.
   * - `false` if the operation encountered an error.
   *
   * @type {true | false}
   */
  status: true | false;

  /**
   * An optional value that can be included in the response.
   * Typically, this is of type `void` and represents no specific value.
   *
   * @type {void | undefined}
   */
  value?: void;

  /**
   * An optional `PortError` object that provides details about an error
   * that occurred during the operation. This property is present only if
   * `status` is `false`, indicating an error.
   *
   * @type {PortError | undefined}
   */
  error?: PortError;
};
