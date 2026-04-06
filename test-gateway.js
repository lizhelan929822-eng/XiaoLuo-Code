const { GatewayServer } = require('./dist/gateway/server');

async function testGateway() {
  const server = new GatewayServer();
  await server.start();
  console.log('Gateway server started, test chat page at http://localhost:3888/chat');
}

testGateway().catch(console.error);
