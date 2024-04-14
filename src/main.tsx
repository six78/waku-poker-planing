import {
  LightNode,
  Protocols,
  createLightNode,
  waitForRemotePeer,
} from "@waku/sdk";
import { createEncoder, createDecoder } from "@waku/sdk";
import protobuf from "protobufjs";
import { appConfig } from "./app/app.config";

// Create a message structure using Protobuf
const ChatMessage = new protobuf.Type("ChatMessage")
  .add(new protobuf.Field("timestamp", 1, "uint64"))
  .add(new protobuf.Field("sender", 2, "string"))
  .add(new protobuf.Field("message", 3, "string"));

const contentTopic = "/light-guide/1/message/proto";

// Create a message encoder and decoder
const decoder = createDecoder(contentTopic);

const encoder = createEncoder({
  contentTopic: contentTopic, // message content topic
  ephemeral: true, // allows messages NOT be stored on the network
});

async function foo() {
  // Create and start a Light Node
  const node = await createLightNode({ bootstrapPeers: appConfig.waku.peers });
  await node.start();

  // Use the stop() function to stop a running node
  // await node.stop();

  // Wait for a successful peer connection
  await waitForRemotePeer(node);

  await waitForRemotePeer(node, [Protocols.LightPush, Protocols.Filter]);

  // Create the callback function
  const callback = (wakuMessage) => {
    // Check if there is a payload on the message
    if (!wakuMessage.payload) return;
    // Render the messageObj as desired in your application
    const messageObj = ChatMessage.decode(wakuMessage.payload);
    console.error(messageObj);
  };

  // Create a Filter subscription
  const subscription = await node.filter.createSubscription();

  // Subscribe to content topics and process new messages
  await subscription.subscribe([decoder], callback);

  let i = 0;
  setInterval(() => {
    send(`lalala${i}`, node);
  }, 1000);
}

function send(text: string, node: LightNode): void {
  const protoMessage = ChatMessage.create({
    timestamp: Date.now(),
    sender: "Alice",
    message: text,
  });

  // Serialise the message using Protobuf
  const serialisedMessage = ChatMessage.encode(protoMessage).finish();

  // Send the message using Light Push
  node.lightPush.send(encoder, {
    payload: serialisedMessage,
  });
}

await foo();
