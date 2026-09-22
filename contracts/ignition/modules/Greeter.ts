import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GreeterModule = buildModule("GreeterModule", (m) => {
  const greeting = m.getParameter("greeting", "Hello, Hardhat Ignition!");

  const greeter = m.contract("Greeter", [greeting]);

  return { greeter };
});

export default GreeterModule;
