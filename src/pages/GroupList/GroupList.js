import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { db, auth, storage } from '../../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const user = auth.currentUser;

    useEffect(() => {
        const fetchGroups = async () => {
            const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
            const querySnapshot = await getDocs(q);
            const groupsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(groupsList);
        };

        fetchGroups();
    }, []);

    const toggleGroup = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    const handleDeleteGroup = async (group) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to exit and delete the group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            const userDocRef = doc(db, 'users', user.uid);
                            await updateDoc(userDocRef, {
                                groups: arrayRemove(group.id)
                            });

                            if (group.participants.length === 1) {
                                // Delete group and associated data
                                await deleteDoc(doc(db, 'groups', group.id));
                                const storageRef = ref(storage, `groupPic/${group.id}`);
                                await deleteObject(storageRef);
                            } else {
                                // Remove user from group participants
                                const groupDocRef = doc(db, 'groups', group.id);
                                await updateDoc(groupDocRef, {
                                    participants: arrayRemove(user.uid)
                                });
                            }

                            setGroups(groups.filter(g => g.id !== group.id));
                            Alert.alert('Success', 'Group deleted successfully');
                        } catch (error) {
                            console.log('Error deleting group:', error);
                            Alert.alert('Error', 'Failed to delete group', error);
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item, index }) => (
        <View>
            <View style={styles.tableRow}>
                <Text style={styles.groupName}>{item.groupName}</Text>
                <View style={styles.icons}>
                    <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
                        <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
                        <Icon name="trash" size={20} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
            {expandedGroup === item.id && (
                <View style={styles.participantsList}>
                    {item.participants.map((participantId, idx) => {
                        // Fetch user details (for example purposes, using hardcoded user details)
                        const participant = getUserDetails(participantId); // Replace with actual fetching logic
                        return (
                            <View key={participantId} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{idx + 1}. <Text style={styles.groupName}>{participant.fullName}</Text></Text>
                                <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );

    const getUserDetails = (userId) => {
        // Replace with actual logic to fetch user details from the database
        return {
            fullName: 'Full Name', // Replace with actual user's full name
            phoneNumber: 'Phone Number' // Replace with actual user's phone number
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Groups</Text>
            <FlatList
                data={groups}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        alignItems: 'center',
    },
    tableCell: {
        flex: 2,
        textAlign: 'left',
        marginLeft: 10, // Move the number and name to the right
    },
    groupName: {
        marginLeft: 15, // Add spacing between the number and the name
        fontWeight: 'bold',
        fontSize: 16,
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15, // Move the icons to the left
    },
    iconButton: {
        marginHorizontal: 10, // Add spacing between the icons
    },
    participantsList: {
        paddingVertical: 10,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    participant: {
        fontSize: 16,
        paddingVertical: 2,
    },
});

export default GroupList;
