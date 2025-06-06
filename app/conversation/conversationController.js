const { sendMessage, getConversation, deleteConversation, getConversations } = require('./conversationService');

exports.sendMessage = async (req, res, next) => {
  try {
    let senderId = req.user._id;
    let { receiverId, text, senderId2 } = req.body;

    if (senderId2) {
      receiverId = senderId;
      senderId = senderId2;
    }

    const conversation = await sendMessage(senderId, receiverId, text);

    req.app.get('io').to(receiverId.toString()).emit('newMessage', {
        conversationId: conversation._id,
        message: conversation.messages[conversation.messages.length - 1]
    });

    if(conversation){
        return res.status(200).json({ message: 'Message sent', conversation });
    }
    res.status(400).json({ message: 'Message not sent', conversation });
  } catch (error) {
    next(error);
  }
};

  

exports.getConversation = async (req, res, next) => {
    try {
      const currentUser = req.user._id;
      const conversationId = req.query?.conversationId;
  
      if (!conversationId) {
        return res.status(400).json({ message: 'Conversation ID is required' });
      }

      const conversation = await getConversation(conversationId);

      if(conversation){
        return res.status(200).json({ conversation, currentUser });
      }
      res.status(404).json({ message : 'Conversation not found' });
    } catch (error) {
      next(error);
    }
};



exports.deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const otherUserId = req.body?.id;

    if (!otherUserId) {
      return res.status(400).json({ message: 'Other user ID is required' });
    }

    const deleted = await deleteConversation( userId, otherUserId );

    if (!deleted) {
      return res.status(404).json({ message: 'Conversation not found or already deleted' });
    }

    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
};



exports.getConversations = async (req, res) => {
  try {
    const userId = req.user?._id;

    const conversations = await getConversations({ userId });

    if(conversations){
      return res.status(200).json({ conversations : conversations, userId : userId});
    }
    res.status(404).json({ message : 'Conversations not found' });
  } catch (err) {
    next(err);
  }
};
