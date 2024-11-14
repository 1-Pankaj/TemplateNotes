import React, { useState, useCallback } from "react";
import { StyleSheet, FlatList, Text, TouchableOpacity, View, Dimensions } from "react-native";
import { FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";
import { primaryColor } from "./Colors";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

export default Home = (props) => {
    const [notes, setNotes] = useState([]);

    const loadNotes = async () => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            if (savedNotes) {
                setNotes(JSON.parse(savedNotes));
            }
        } catch (error) {
            console.error("Failed to load notes:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotes();
        }, [])
    );

    const deleteNote = async (id) => {
        try {
            const savedNotes = await AsyncStorage.getItem('notes');
            const notes = savedNotes ? JSON.parse(savedNotes) : [];

            // Filter out the note to be deleted
            const updatedNotes = notes.filter(note => note.id !== id);

            // Save the updated notes back to AsyncStorage
            await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));

            // Update the local state
            setNotes(updatedNotes);
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => props.navigation.navigate("Note", { noteId: item.id, noteContent: item.html })}
            style={styles.noteItem}
        >
            <Text style={styles.noteText}>{item.content.slice(0, 50)}...</Text>
            <TouchableOpacity onPress={() => {
                deleteNote(item.id)
            }}>
                <MaterialIcons name="delete" size={20}
                    color={"red"} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>

{
                notes.length > 0 ? (
                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                ) : (
                    <View style={styles.noNotesContainer}>
                        <Text style={styles.noNotesText}>No saved notes found!</Text>
                    </View>
                )
            }
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => props.navigation.navigate("Note")}
                color="white"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: primaryColor,
    },
    noteItem: {
        padding: 25,
        width: '95%',
        elevation: 1,
        borderRadius: 10,
        backgroundColor: 'white',
        alignSelf: 'center',
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    noteText: {
        fontSize: 16,
        flex: 1
    },
    noNotesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    noNotesText: {
        fontSize: 18,
        color: '#888'
    }
});
