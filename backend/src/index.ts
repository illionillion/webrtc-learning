import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
//モデル読み込み
// import { ClientToServerEvents, ServerToClientEvents } from "./models";

const app = express();
// publicディレクトリを公開
app.use(express.static(__dirname + '/public'))
const httpServer = createServer(app);
// const io = new Server<ClientToServerEvents, ServerToClientEvents>(
const io = new Server(
  httpServer,
  //CORS対策
  {
    cors: {
      origin: ["http://localhost:5173"],
    },
  }
);

/**
 * シグナリングサーバー（WebSocketサーバー） + Webサーバー
 */

// 接続要求
io.on("connect", (socket) => {
  console.log("io", "connect");
  console.log("io", "socket: ", socket.id);

  // 受信側からの配信要求を配信側へ渡す
  socket.on("request", () =>
    socket.broadcast.emit("request", { cid: socket.id })
  );

  // 配信側からのオファーを受信側へ渡す
  socket.on("offer", ({ offer }) => {
    socket.broadcast.emit("offer", { offer });
    // 配信側の接続が切れた場合にそれを受信側へ通知する
    socket.on("disconnect", () => socket.broadcast.emit("close"));
  });

  // 受信側からのアンサーを配信側へ渡す
  socket.on("answer", ({ answer }) =>
    socket.broadcast.emit("answer", { cid: socket.id, answer })
  );
});

// サーバーを3001番ポートで起動
httpServer.listen(3001, () => {
  console.log("Server start on port 3001.");
});
