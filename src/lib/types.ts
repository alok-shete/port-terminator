import { PortError } from "./portError";

export type PORT_TERMINATOR_RESPONSE = {
  status: true | false;
  value?: void;
  error?: PortError;
};
