import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import pgService from '../../services/pg.service';
import PGListItem from '../../components/shared/PGListItem';
import ScreenHeader from '../../components/layout/ScreenHeader';

export default function AIChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      text: 'Hi! I am your AI assistant. Tell me what kind of PG you are looking for. For example: "I need a single room in Hinjewadi under 15k with AC and food."',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Call AI endpoint
      const result = await pgService.aiSearch(q);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `I found ${result.pgs.length} options matching your request!`,
        pgs: result.pgs,
        analysis: result.analysis,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        text: 'Sorry, I encountered an error searching. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && (
          <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.aiAvatar}>
            <Ionicons name="sparkles" size={14} color="#fff" />
          </LinearGradient>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.msgText, isUser ? { color: '#fff' } : { color: colors.textPrimary }]}>
            {item.text}
          </Text>

          {/* AI Analysis Chips */}
          {item.analysis && (
            <View style={styles.chipRow}>
              {item.analysis.city && <Text style={styles.aiChip}>{item.analysis.city}</Text>}
              {item.analysis.area && <Text style={styles.aiChip}>{item.analysis.area}</Text>}
              {item.analysis.budget && <Text style={styles.aiChip}>&lt; ₹{item.analysis.budget}</Text>}
            </View>
          )}

          {/* PG Results */}
          {item.pgs && item.pgs.length > 0 && (
            <View style={styles.resultsContainer}>
              {item.pgs.slice(0, 3).map((pg) => (
                <PGListItem
                  key={pg._id}
                  pg={pg}
                  onPress={() => navigation.navigate('PGDetail', { pgId: pg._id })}
                />
              ))}
              {item.pgs.length > 3 && (
                <TouchableOpacity style={styles.viewMoreBtn} onPress={() => {}}>
                  <Text style={styles.viewMoreText}>View all {item.pgs.length} results</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };




  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? 'padding' : 'padding'}>
      <ScreenHeader
        title="AI Assistant"
        subtitle="Natural language search"
        onBack={() => navigation.goBack()}
        gradient textColor="light"
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <Text style={{ fontSize: 12, color: colors.textMuted }}>AI is searching...</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="E.g., Single room in Wakad under 10k"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.screenPadding, paddingBottom: 20 },
  msgWrapper: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-end' },
  msgRight: { justifyContent: 'flex-end' },
  msgLeft: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.borderLight },
  msgText: { fontSize: 15, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  aiChip: {
    backgroundColor: '#ede9fe', color: '#5b21b6', fontSize: 11,
    fontWeight: '600', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12,
  },
  resultsContainer: { marginTop: 16, gap: 10 },
  viewMoreBtn: { alignItems: 'center', paddingVertical: 8 },
  viewMoreText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  typingIndicator: { paddingHorizontal: 20, paddingBottom: 10, marginLeft: 36 },
  inputArea: {
    backgroundColor: colors.surface, padding: 12,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: colors.surfaceAlt, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  input: { flex: 1, maxHeight: 100, fontSize: 15, color: colors.textPrimary, paddingTop: 4, paddingBottom: 4 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center',
    marginLeft: 10,
  },
});
