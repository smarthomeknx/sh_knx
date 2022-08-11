import { response } from "express";
import ConnectionResponse from "../../../../src/main/knx/messages/ConnectionResponse";

test("Parsing Error Response", () => {
  // GIVEN
  const incoming: Buffer = Buffer.from([0x06, 0x10, 0x02, 0x06, 0x00, 0x08, 0x00, 0x22]);

  // WHEN
  const response: ConnectionResponse = new ConnectionResponse();
  response.fromBuffer(incoming);

  // THEN
  expect(response.connectionResponseBaseStructure.data.CommunicationChannelID).toBe(0);
  expect(response.connectionResponseBaseStructure.data.Status).toBe(0x22);
});
