// Import the functions and types from the "terminator" and "types" modules
import { portTerminator, isPortOpen, portsTerminator } from "./terminator";
import { PORT_TERMINATOR_RESPONSE } from "./types";

// Create an object named "terminator" to hold references to the functions
const terminator = {
  portTerminator,
  isPortOpen,
  portsTerminator,
};

// Export individual functions and the PORT_TERMINATOR_RESPONSE type
export { portTerminator, isPortOpen, portsTerminator, PORT_TERMINATOR_RESPONSE };

// Export the "terminator" object as the default export
export default terminator;
