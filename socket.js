import Friend from "./models/friend.js";

export let socketUser = {};
const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.userId = userId;
      socketUser[userId] = socket.id;
      console.log(socketUser);
    }
    // Listen for the disconnect event
    socket.on("disconnect", () => {
      delete socketUser[socket.userId];
      console.log(socketUser); // Remove user from active connections
    });

    socket.on("songPlay", async (data) => {
      try {
        const userId = socket.userId;
        console.log(userId, data, "d");
        const friendIds = [];
        const friends = await Friend.find({
          $or: [{ recipient: userId }, { requester: userId }],
          status: "accepted",
        });

        friends.forEach((fr) => {
          if (fr.requester !== userId) {
            friendIds.push(fr.requester);
          } else {
            friendIds.push(fr.recipient);
          }
        });
        console.log(friendIds, "fr");
        if (friendIds.length > 0) {
          friendIds.forEach((friendId) => {
            const friendSocketId = socketUser[String(friendId)];
            console.log("frSocketId", friendSocketId); // Get the socket ID of the friend
            if (friendSocketId) {
              io.to(friendSocketId).emit("friendSong", {
                userId: userId,
                song: data,
              });
            }
          });
        }

        return res.status(200).json({ success: true, friends });
      } catch (error) {}
    });
  });
};
export default initializeSocket;
