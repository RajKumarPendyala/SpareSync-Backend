const Conversation = require('./ConversationModel');

exports.sendMessage = async (senderId, receiverId, text) => {
  if (!receiverId || !text) throw new Error('receiverId and text are required');

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
    isDeleted: false
  });

  const message = {
    senderId,
    text
  };

  if (!conversation) {
    conversation = new Conversation({
      participants: [senderId, receiverId],
      messages: [message]
    });
  } else {
    conversation.messages.push(message);
  }

  await conversation.save();
  return conversation;
};



exports.getConversation = async (conversationId) => {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      isDeleted: false
    }).populate('participants', 'name image') 
  
    return conversation;
};


exports.deleteConversation = async ( userId, otherUserId ) => {
  const conversation = await Conversation.findOneAndUpdate(
    {
      participants: { $all: [userId, otherUserId] },
      isDeleted: false
    },
    {
      isDeleted: true
    },
    {
      new: true
    }
  );

  return conversation;
};



exports.getConversations = async ({ userId }) => {
  const conversations = await Conversation.find({
    participants: userId,
    isDeleted: false
  })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name image')
    .lean();


  const result = conversations.map(conv => {
    const lastMessage = conv.messages[conv.messages.length - 1];
    return {
      _id: conv._id,
      participants: conv.participants,
      lastMessage,
      updatedAt: conv.updatedAt
    };
  });

  return result;
};
