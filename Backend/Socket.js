const { Server } = require("socket.io");
const User = require("./Modals/User");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("register", async ({ userId, role }) => {
      socket.userId = userId;

      await User.findOneAndUpdate(
        { userId },
        {
          userId,
          role,
          socketId: socket.id,
          loginTime: new Date(),
          logoutTime: null,
          status: "active",
        },
        { upsert: true }
      );

      console.log(`✅ ${userId} marked ACTIVE`);
    });

    socket.on("logout", async () => {
      if (socket.userId) {
        await User.findOneAndUpdate(
          { userId: socket.userId },
          {
            status: "deactivated",
            logoutTime: new Date(),
            socketId: null,
          }
        );

        console.log(`🚪 ${socket.userId} logged out`);
      }
      socket.disconnect(true);
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        await User.findOneAndUpdate(
          { userId: socket.userId },
          {
            status: "deactivated",
            logoutTime: new Date(),
            socketId: null,
          }
        );
        console.log(`🔴 ${socket.userId} disconnected`);
      }
    });
  });
}

module.exports = initSocket;
