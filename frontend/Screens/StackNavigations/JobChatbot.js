import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
// import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const THEME = {
  PRIMARY: '#6366f1',
  PRIMARY_DARK: '#4f46e5',
  PRIMARY_LIGHT: '#a5b4fc',
  PRIMARY_TINT: 'rgba(99, 102, 241, 0.1)',
  BACKGROUND: '#f8fafc',
  CARD_BACKGROUND: '#ffffff',
  TEXT_PRIMARY: '#1e293b',
  TEXT_SECONDARY: '#475569',
  TEXT_MUTED: '#64748b',
  BORDER: '#e2e8f0',
  SUCCESS: '#22c55e',
  SUCCESS_LIGHT: '#dcfce7',
  USER_MESSAGE: '#6366f1',
  BOT_MESSAGE: '#f1f5f9',
  BOT_MESSAGE_BORDER: '#e2e8f0',
};

import { chatBotApi } from "../ApiCalls/SignIn_Api";

const JobChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Welcome to JobPath Career Assistant! 🚀\n\nI\'m here to help you with:\n• Career guidance & advice\n• Skill development tips\n• Job search strategies\n• Industry insights\n\nWhat would you like to explore today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [userMessage, ...prev]);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatBotApi(input);
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: reply,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [botMessage, ...prev]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        {
          id: (Date.now() + 1).toString(),
          text: '⚠️ I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
          sender: 'bot',
          timestamp: new Date(),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('✅ Copied!', 'Message copied to clipboard');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to copy message');
    }
  };

  const formatTime = (timestamp) => {
    return timestamp?.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderTypingIndicator = () => (
    <View style={styles.messageRow}>
      <View style={styles.botAvatarContainer}>
        <MaterialIcons name="smart-toy" size={20} color={THEME.PRIMARY} />
      </View>
      <View style={[styles.message, styles.botMsg, styles.typingContainer]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
        <Text style={styles.typingText}>JobPath AI is thinking...</Text>
      </View>
    </View>
  );

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageRow,
      item.sender === 'user' ? styles.userMessageRow : styles.botMessageRow
    ]}>
      {item.sender === 'bot' && (
        <View style={styles.botAvatarContainer}>
          <MaterialIcons name="smart-toy" size={20} color={THEME.PRIMARY} />
        </View>
      )}

      {item.sender === 'user' && (
        <View style={styles.userAvatarContainer}>
          <MaterialIcons name="person" size={20} color="white" />
        </View>
      )}
      
      <View
        style={[
          styles.message,
          item.sender === 'user' ? styles.userMsg : styles.botMsg,
        ]}
      >
        <Text style={[
          styles.msgText,
          item.sender === 'user' ? styles.userMsgText : styles.botMsgText
        ]}>
          {item.text}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
          
          {item.sender === 'bot' && (
            <TouchableOpacity
              onPress={() => copyToClipboard(item.text)}
              style={styles.copyBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="content-copy" size={16} color={THEME.TEXT_MUTED} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerIconContainer}>
          <MaterialIcons name="smart-toy" size={24} color={THEME.PRIMARY} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>JobPath AI Assistant</Text>
          <Text style={styles.headerSubtitle}>Your career guidance companion</Text>
        </View>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineStatus} />
        </View>
      </View>
    </View>
  );

  const quickSuggestions = [
    "Tell me about software engineering careers",
    "What skills should I develop?",
    "How to prepare for interviews?",
    "Career change advice"
  ];

  const renderQuickSuggestions = () => (
    messages.length === 1 && (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Quick questions to get started:</Text>
        {quickSuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => setInput(suggestion)}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
            <MaterialIcons name="arrow-forward" size={16} color={THEME.PRIMARY} />
          </TouchableOpacity>
        ))}
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="light" backgroundColor={THEME.PRIMARY} /> */}
      
      {renderHeader()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesList}
          ListHeaderComponent={renderQuickSuggestions}
        />

        {loading && renderTypingIndicator()}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, loading && styles.disabledInput]}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about skills, or job advice..."
              placeholderTextColor={THEME.TEXT_MUTED}
              editable={!loading}
              multiline
              maxLength={500}
              textAlignVertical="center"
            />
            <TouchableOpacity
              style={[styles.sendBtn, loading && styles.disabledBtn]}
              onPress={handleSend}
              disabled={loading || !input.trim()}
            >
              <MaterialIcons 
                name="send" 
                size={20} 
                color={loading || !input.trim() ? THEME.TEXT_MUTED : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default JobChatbot;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },
  header: {
    backgroundColor: THEME.CARD_BACKGROUND,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: THEME.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingTop: 40
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.PRIMARY_TINT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    marginTop: 2,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.SUCCESS,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    paddingHorizontal: 4,
  },
  // Fixed: User messages aligned to right
  userMessageRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  // Fixed: Bot messages aligned to left
  botMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  botAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.PRIMARY_TINT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  message: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMsg: {
    backgroundColor: THEME.USER_MESSAGE,
    borderBottomRightRadius: 4,
  },
  botMsg: {
    backgroundColor: THEME.BOT_MESSAGE,
    borderWidth: 1,
    borderColor: THEME.BOT_MESSAGE_BORDER,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMsgText: {
    color: 'white',
    fontWeight: '500',
  },
  botMsgText: {
    color: THEME.TEXT_PRIMARY,
    fontWeight: '400',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  botTimestamp: {
    color: THEME.TEXT_MUTED,
  },
  copyBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.PRIMARY,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.BORDER,
  },
  suggestionText: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    flex: 1,
    marginRight: 8,
  },
  inputContainer: {
    backgroundColor: THEME.CARD_BACKGROUND,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.BORDER,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: THEME.BACKGROUND,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    minHeight: 48, // Fixed: Added minimum height
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    maxHeight: 100,
    minHeight: 40, // Fixed: Added minimum height for input
    textAlignVertical: 'top', // Fixed: Align text to top for multiline
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledBtn: {
    backgroundColor: THEME.TEXT_MUTED,
    shadowOpacity: 0,
    elevation: 0,
  },
});