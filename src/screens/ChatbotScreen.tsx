import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Alert } from 'react-native';

let config = require('../server/config');

type Message = {
    id: string;
    text: string;
    isUser: boolean;
};

const ChatbotScreen = ({ navigation }: any) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am your Study Assistant. What can I help you today?',
            isUser: false,
        },
    ]);

    const sendMessage = () => {
        if (!input.trim())
            return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            isUser: true,
        };
        setMessages(prev => [...prev, userMessage]);
        const userInput = input;
        setInput('');

        let url = config.settings.serverPath + '/api/chatbot';
        console.log(url);

        fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userInput }),
        })
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    Alert.alert('Error:', response.status.toString());
                    throw Error('Error ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.reply,
                    isUser: false,
                };
                setMessages(prev => [...prev, botMessage]);
            })
            .catch(error => {
                console.log(error);
                Alert.alert('Error', 'Failed to connect to server');
            })
    };

    const renderMessage = ({ item }: { item: Message }) => {
        return (
            <View style={[styles.messageRow, item.isUser ? styles.userRow : styles.botRow]}>
                <View style={[styles.bubble, item.isUser ? styles.userBubble : styles.botBubble]}>
                    <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={0}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chatbot</Text>
                <View style={{ width: 50 }} />
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor="#888"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#4A90E2',
    },
    backButton: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    chatList: {
        padding: 15,
        flexGrow: 1,
    },
    messageRow: {
        marginBottom: 12,
    },
    userRow: {
        alignItems: 'flex-end',
    },
    botRow: {
        alignItems: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
    },
    userBubble: {
        backgroundColor: '#4A90E2',
    },
    botBubble: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    messageText: {
        fontSize: 15,
    },
    userText: {
        color: '#fff',
    },
    botText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
         paddingBottom: 85,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 25,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ChatbotScreen;