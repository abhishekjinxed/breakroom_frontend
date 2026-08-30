import { useEffect, useRef, useState } from "react";

import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getSocket } from "../../services/socket";
import { leaveBored } from "../../api/bored";
import { getChatMessages } from "../../api/chat";
import { requestWorkCircleFromChat } from "../../api/work-circle";
import { deleteDirectConversation, getDirectMessages } from "../../api/inbox";
import { Brand } from "../../constants/brand";
import { useAuth } from "../../context/AuthContext";

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export default function ChatScreen() {
  const { token, user } = useAuth();
  const { chatId, direct } = useLocalSearchParams<{
    chatId: string;
    direct?: string;
  }>();
  const isDirect = direct === "1";

  const [messages, setMessages] = useState<Message[]>([]);

  const [text, setText] = useState("");

  const [connected, setConnected] = useState(false);

  const [joined, setJoined] = useState(false);

  const [chatError, setChatError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId) {
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      if (!token) return;
      try {
        const history = isDirect ? await getDirectMessages(token, chatId) : await getChatMessages(token, chatId);
        if (!cancelled) setMessages(history.map((message: Message) => ({ ...message, chatId: message.chatId ?? chatId })));
      } catch (error) {
        console.error("CHAT HISTORY ERROR:", error);
        if (!cancelled) setChatError("Unable to load chat history");
      }
    }
    loadHistory();

    const socket = getSocket();

    if (!socket) {
      console.error("❌ No Socket.IO connection");

      return;
    }

    console.log("Joining chat:", chatId);

    setConnected(socket.connected);
    setJoined(false);
    setChatError(null);

    // Join the Socket.IO chat room
    socket.emit("chat:join", chatId);

    const handleConnect = () => {
      setConnected(true);

      socket.emit("chat:join", chatId);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleJoined = (data: { chatId: string }) => {
      console.log("✅ Joined chat:", data.chatId);

      if (data.chatId === chatId) {
        setJoined(true);
      }
    };

    const handleMessage = (message: Message) => {
      console.log("💬 Message received:", message);

      setMessages((current) => {
        // Prevent duplicate messages
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    };

    const handleError = (error: { message: string }) => {
      console.error("CHAT SOCKET ERROR:", error.message);
      setJoined(false);
      setChatError(error.message);
    };

    const handlePartnerLeft = (data: { chatId: string }) => {
      if (data.chatId === chatId) {
        router.replace("/");
      }
    };

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("chat:joined", handleJoined);

    socket.on("chat:message", handleMessage);

    socket.on("chat:error", handleError);

    socket.on("chat:partner-left", handlePartnerLeft);

    return () => {
      cancelled = true;
      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("chat:joined", handleJoined);

      socket.off("chat:message", handleMessage);

      socket.off("chat:error", handleError);

      socket.off("chat:partner-left", handlePartnerLeft);
    };
  }, [chatId, token, isDirect]);

  function sendMessage() {
    const message = text.trim();

    if (!message) {
      return;
    }

    if (!chatId) {
      return;
    }

    const socket = getSocket();

    if (!socket) {
      console.error("Socket not available");

      return;
    }

    if (!socket.connected) {
      console.error("Socket is disconnected");

      return;
    }

    setSending(true);

    socket.emit("chat:message", {
      chatId,
      text: message,
    });

    setText("");

    setSending(false);

    inputRef.current?.focus();
  }

  async function handleLeaveChat() {
    if (isDirect) {
      router.back();
      return;
    }
    try {
      if (token) {
        await leaveBored(token);
      }
    } catch (error) {
      console.error("LEAVE CHAT ERROR:", error);
    } finally {
      router.replace("/");
    }
  }

  async function addToWorkCircle() {
    if (!token || !chatId || isDirect) return;
    try { const result = await requestWorkCircleFromChat(token, chatId); Alert.alert("Work Circle", result.message ?? "Connection request sent."); }
    catch (error: any) { Alert.alert("Work Circle", error?.response?.data?.message ?? "We could not send the request."); }
  }

  function confirmDeleteConversation() {
    if (!token || !chatId) return;
    Alert.alert("Delete this conversation?", "Deleting this chat will also remove this person from your friends. You will need to send a new request to connect again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete & Remove Friend", style: "destructive", onPress: async () => { try { await deleteDirectConversation(token, chatId); router.replace("/inbox" as any); } catch { Alert.alert("Couldn’t delete conversation", "Please try again."); } } },
    ]);
  }

  function renderMessage({ item }: { item: Message }) {
    const isOwnMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleLeaveChat}
          style={styles.backButton}
        >
          <Text style={styles.leaveText}>{isDirect ? "Back" : "Leave chat"}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.username}>{isDirect ? "Work Circle" : "Breakroom chat"}</Text>

          <Text
            style={[
              styles.status,
              {
                color: chatError
                  ? Brand.colors.danger
                  : joined && connected
                    ? Brand.colors.green
                    : Brand.colors.muted,
              },
            ]}
          >
            {chatError
              ? chatError
              : joined
                ? "● Connected"
                : "○ Joining chat..."}
          </Text>
        </View>

        {isDirect ? <TouchableOpacity onPress={confirmDeleteConversation} style={styles.circleLink}><Text style={styles.deleteLinkText}>Delete</Text></TouchableOpacity> : <TouchableOpacity onPress={addToWorkCircle} style={styles.circleLink}><Text style={styles.circleLinkText}>Add</Text></TouchableOpacity>}
      </View>

      {/* MESSAGES */}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={
          messages.length === 0 ? styles.emptyList : styles.messageList
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({
            animated: true,
          })
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emoji}>👋</Text>

            <Text style={styles.emptyTitle}>You're connected!</Text>

            <Text style={styles.emptyText}>
              Say hi and start the conversation.
            </Text>
          </View>
        }
      />

      {/* INPUT */}

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          submitBehavior="submit"
          maxLength={2000}
          editable={connected && joined}
          onKeyPress={(event) => {
            if (
              Platform.OS === "web" &&
              event.nativeEvent.key === "Enter"
            ) {
              event.preventDefault();
              sendMessage();
            }
          }}
          onSubmitEditing={() => {
            sendMessage();
          }}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || !connected || !joined || sending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!text.trim() || !connected || !joined || sending}
        >
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.colors.canvas,
  },

  header: {
    height: 82,
    paddingTop: 24,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.colors.border,
  },

  backButton: {
    width: 82,
    paddingVertical: 8,
  },

  leaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.colors.danger,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerSpacer: {
    width: 82,
  },
  circleLink: { width: 82, alignItems: "flex-end", paddingVertical: 8 },
  circleLinkText: { color: Brand.colors.teal, fontSize: 13, fontWeight: "800" },
  deleteLinkText: { color: Brand.colors.danger, fontSize: 13, fontWeight: "800" },

  username: {
    fontSize: 17,
    fontWeight: "700",
    color: Brand.colors.navy,
  },

  status: {
    fontSize: 12,
    marginTop: 3,
  },

  messageList: {
    padding: 20,
    paddingBottom: 20,
  },

  messageRow: {
    marginBottom: 10,
  },

  ownMessageRow: {
    alignItems: "flex-end",
  },

  otherMessageRow: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  ownMessageBubble: {
    backgroundColor: Brand.colors.bubbleOwn,
    borderBottomRightRadius: 5,
  },

  otherMessageBubble: {
    backgroundColor: Brand.colors.bubbleOther,
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 21,
  },

  ownMessageText: {
    color: "#FFFFFF",
  },

  otherMessageText: {
    color: Brand.colors.text,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },

  emoji: {
    fontSize: 45,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 15,
    color: Brand.colors.navy,
  },

  emptyText: {
    textAlign: "center",
    color: Brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: Brand.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Brand.colors.border,
    gap: 10,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: Brand.radius.control,
    backgroundColor: "#EEF3F7",
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: Brand.colors.text,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: Brand.radius.control,
    backgroundColor: Brand.colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
});
