import React, { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RichText, TenTapStartKit, Toolbar, useEditorBridge } from "@10play/tentap-editor";
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Correct import for SafeAreaView
import { FAB } from "react-native-paper"; // Correct import for FAB
import { primaryColor } from "./Colors";

export default function Note({ navigation, route }) { // Ensure this is a function component
    const editor = useEditorBridge({
        autofocus: true,
        avoidIosKeyboard: true,
        initialContent: route.params?.noteContent || '',
        theme: {
            webview: {
                cursor: primaryColor
            }
        },
        bridgeExtensions: TenTapStartKit,
    });

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);


    const saveNote = async () => {
        try {
            const content = await editor.getText();
            const html = await editor.getHTML()
            const newNote = {
                id: route.params?.noteId || Date.now().toString(),
                content, html
            };

            const savedNotes = await AsyncStorage.getItem('notes');
            const notes = savedNotes ? JSON.parse(savedNotes) : [];

            const updatedNotes = route.params?.noteId
                ? notes.map(note => note.id === newNote.id ? newNote : note)
                : [...notes, newNote];

            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
            navigation.goBack();
        } catch (error) {
            console.error("Failed to save note:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <RichText editor={editor} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{
                    position: 'absolute',
                    width: '100%',
                    bottom: 0,
                }}
            >
                <FAB
                    icon="content-save"
                    style={[styles.fab,{
                        bottom: isKeyboardVisible ? 50 : 0,
                    }]}
                    onPress={saveNote}
                    color="white"
                />
                <Toolbar editor={editor} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        
        backgroundColor: primaryColor,
    },
});
