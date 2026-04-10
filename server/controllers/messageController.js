const Message = require("../models/Message");
const Room = require("../models/room");
const { isValidObjectId } = require("../utils/validators");

const getInbox = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { recipient: currentUserId }]
    })
      .populate("room", "title location image")
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    const threadsMap = new Map();

    for (const m of messages) {
      if (!m.room) continue;

      const senderId = m.sender?._id?.toString();
      const recipientId = m.recipient?._id?.toString();
      const otherUser = senderId === currentUserId ? m.recipient : m.sender;
      const otherUserId = otherUser?._id?.toString() || "unknown";
      const roomId = m.room._id.toString();
      const key = `${roomId}:${otherUserId}`;

      if (!threadsMap.has(key)) {
        threadsMap.set(key, {
          threadKey: key,
          room: m.room,
          otherUser,
          lastMessage: m.text,
          updatedAt: m.createdAt
        });
      }
    }

    const threads = Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load inbox", error: err.message });
  }
};

const getListingsInbox = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const myRooms = await Room.find({ postedBy: currentUserId }).select("_id");
    const roomIds = myRooms.map((r) => r._id);

    if (roomIds.length === 0) return res.json([]);

    const messages = await Message.find({ room: { $in: roomIds } })
      .populate("room", "title location image postedBy")
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 });

    const threadsMap = new Map();

    for (const m of messages) {
      if (!m.room) continue;

      const senderId = m.sender?._id?.toString();
      const recipientId = m.recipient?._id?.toString();
      const otherUser = senderId === currentUserId ? m.recipient : m.sender;
      const otherUserId = otherUser?._id?.toString();
      if (!otherUserId || otherUserId === currentUserId) continue;

      const roomId = m.room._id.toString();
      const key = `${roomId}:${otherUserId}`;

      if (!threadsMap.has(key)) {
        threadsMap.set(key, {
          threadKey: key,
          room: m.room,
          otherUser,
          lastMessage: m.text,
          updatedAt: m.createdAt
        });
      }
    }

    const threads = Array.from(threadsMap.values()).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: "Failed to load listing messages", error: err.message });
  }
};

const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { otherUserId } = req.query || {};
    const currentUserId = req.user._id;
    if (!isValidObjectId(roomId)) return res.status(400).json({ message: "Invalid room id" });
    if (otherUserId && !isValidObjectId(otherUserId)) return res.status(400).json({ message: "Invalid otherUserId" });

    const room = await Room.findById(roomId).select("postedBy");
    if (!room) return res.status(404).json({ message: "Room not found" });

    const landlordId = room.postedBy?.toString();
    const isLandlord = landlordId === currentUserId;

    const filter = isLandlord
      ? (otherUserId
          ? {
              room: roomId,
              $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
              ]
            }
          : { room: roomId })
      : {
          room: roomId,
          $or: [
            { sender: currentUserId, recipient: landlordId },
            { sender: landlordId, recipient: currentUserId }
          ]
        };

    const messages = await Message.find(filter)
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages", error: err.message });
  }
};

const sendMessageToLandlord = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, recipientId } = req.body || {};
    const currentUserId = req.user._id;
    if (!isValidObjectId(roomId)) return res.status(400).json({ message: "Invalid room id" });

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }
    if (String(text).trim().length > 2000) {
      return res.status(400).json({ message: "Message must be 2000 characters or fewer" });
    }

    const room = await Room.findById(roomId).select("postedBy");
    if (!room) return res.status(404).json({ message: "Room not found" });

    const landlordId = room.postedBy?.toString();
    if (!landlordId) return res.status(400).json({ message: "Room has no landlord" });

    const isLandlord = landlordId === currentUserId;
    let recipient = landlordId;

    if (isLandlord) {
      if (!recipientId) {
        return res.status(400).json({ message: "recipientId is required for landlord replies" });
      }
      if (!isValidObjectId(recipientId)) {
        return res.status(400).json({ message: "Invalid recipientId" });
      }
      if (recipientId === currentUserId) {
        return res.status(400).json({ message: "You cannot message yourself" });
      }
      recipient = recipientId;
    }

    const message = await Message.create({
      room: roomId,
      sender: currentUserId,
      recipient,
      text: text.trim()
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("recipient", "name email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
};

module.exports = { getInbox, getListingsInbox, getRoomMessages, sendMessageToLandlord };
