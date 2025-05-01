import messages from "../models/message.js";

export const saveMessage = async (req, res) => {
    try {
      const { sender, senderName, text, room } = req.body;
  
      if (!sender || !senderName || !text || !room) {
        return res.status(400).json({ message: 'Missing fields' });
      }
  
      const newMessage = await messages.create({ sender, senderName, text, room });
  
      res.status(201).json({ data: newMessage });
    } catch (error) {
      console.error('Save Message Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
export const getMessageByRoom = async (req, res) => {
  try {
    const room = req.params.room;

    const messageList = await messages.find({ room }).sort({ createdAt: 1 });

    if (messageList.length === 0) {
      return res.status(404).json({ message: "No messages in this room" });
    }

    res.status(200).json(messageList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages: " + error });
  }
};
