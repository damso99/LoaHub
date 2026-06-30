package com.loahub.message;

import com.loahub.message.dto.MessageResponse;
import com.loahub.message.dto.MessageThreadResponse;
import com.loahub.message.model.MessageRow;
import com.loahub.message.model.MessageThreadRow;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MessageMapper {
    Optional<MessageThreadRow> findThreadById(@Param("threadId") long threadId);

    Optional<MessageThreadRow> findThreadByParticipants(@Param("senderId") long senderId, @Param("receiverId") long receiverId);

    List<MessageThreadResponse> findThreadResponsesByUserId(@Param("userId") long userId);

    List<MessageResponse> findMessagesByThreadId(@Param("threadId") long threadId, @Param("userId") long userId);

    long countUnreadMessagesByUserId(@Param("userId") long userId);

    long countUnreadMessagesByThreadIdAndUserId(@Param("threadId") long threadId, @Param("userId") long userId);

    int insertThread(@Param("senderId") long senderId, @Param("receiverId") long receiverId, @Param("lastMessage") String lastMessage);

    int insertMessage(@Param("threadId") long threadId, @Param("senderId") long senderId, @Param("receiverId") long receiverId, @Param("content") String content);

    int markMessagesRead(@Param("threadId") long threadId, @Param("userId") long userId);

    int softDeleteThread(@Param("threadId") long threadId, @Param("userId") long userId);

    int restoreThread(@Param("threadId") long threadId);

    int touchThread(@Param("threadId") long threadId, @Param("lastMessage") String lastMessage);
}
