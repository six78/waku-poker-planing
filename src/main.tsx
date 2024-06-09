import {
  LightNode,
  Protocols,
  createLightNode,
  waitForRemotePeer,
} from "@waku/sdk";
import { createEncoder, createDecoder } from "@waku/sdk";
import protobuf from "protobufjs";

// Create a message structure using Protobuf
const ChatMessage = new protobuf.Type("ChatMessage")
    .add(new protobuf.Field("timestamp", 1, "uint64"))
    .add(new protobuf.Field("sender", 2, "string"))
    .add(new protobuf.Field("message", 3, "string"));

const contentTopic = "/light-guide/1/message/proto";
const pubsubTopic = "/waku/2/default-waku/proto"

// Create a message encoder and decoder
const decoder = createDecoder(contentTopic, pubsubTopic);
const encoder = createEncoder({
  pubsubTopic: pubsubTopic,
  contentTopic: contentTopic, // message content topic
  ephemeral: true, // allows messages NOT be stored on the network
});

async function foo() {
  console.log("<<< foo")

  // Create and start a Light Node
  const node = await createLightNode({ defaultBootstrap: true });
  await node.start();

  // Wait for a successful peer connection
  await waitForRemotePeer(node, [
      Protocols.LightPush,
      Protocols.Filter
  ]);

  // Create the callback function
  const callback = (wakuMessage) => {
    // Check if there is a payload on the message
    if (!wakuMessage.payload) return;
    // Render the messageObj as desired in your application
    const messageObj = ChatMessage.decode(wakuMessage.payload);
    console.warn("<<< RECEIVED MESSAGE", messageObj);
  };

  if (localStorage.getItem("receive") == 'true') {
    // Create a Filter subscription
    const subscription = await node.filter.createSubscription(pubsubTopic);

    if (subscription.subscription == null) {
      console.error("subscription is null")
    } else {
      // Subscribe to content topics and process new messages
      await subscription.subscription.subscribe([decoder], callback);
      }
  }

  // Send a message every second
  if (localStorage.getItem("send") == 'true') {
    let i = 1;
    setInterval(() => {
        send(`message ${i}`, node);
        i++;
    }, 1000);
  }
}

async function send(text: string, node: LightNode){
  const protoMessage = ChatMessage.create({
    timestamp: Date.now(),
    sender: "Alice",
    message: text,
  });

  console.log("<<< SENDING", protoMessage)

  // Serialise the message using Protobuf
  const serialisedMessage = ChatMessage.encode(protoMessage).finish();

  // Send the message using Light Push
  await node.lightPush.send(encoder, {
    payload: serialisedMessage,
  });
}

await foo();
