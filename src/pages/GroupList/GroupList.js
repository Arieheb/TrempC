import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { db, auth, storage } from '../../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import * as Contacts from 'expo-contacts';
import Icon from 'react-native-vector-icons/FontAwesome';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentGroup, setCurrentGroup] = useState(null);
    const [groupsLoading, setGroupsLoading] = useState(true);
    const [contactsLoading, setContactsLoading] = useState(true);

    const user = auth.currentUser;

    useEffect(() => {
        fetchGroups();
        preFetchContacts();
    }, []);

    const fetchGroups = async () => {
        setGroupsLoading(true);
        const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
        const querySnapshot = await getDocs(q);
        const groupsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
            const groupData = { id: doc.id, ...doc.data() };
            const participants = await Promise.all(groupData.participants.map(async (participantId) => {
                if (participantId === user.uid) {
                    return { fullName: 'Me', phoneNumber: user.phoneNumber, id: participantId };
                }
                const details = await getUserDetails(participantId);
                return { ...details, id: participantId };
            }));
            // Move the current user to the first position
            const currentUserIndex = participants.findIndex(p => p.id === user.uid);
            if (currentUserIndex > -1) {
                const currentUser = participants.splice(currentUserIndex, 1)[0];
                participants.unshift(currentUser);
            }
            groupData.participantsDetails = participants;
            return groupData;
        }));
        setGroups(groupsList);
        setGroupsLoading(false);
    };

    const preFetchContacts = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            setPermissionGranted(true);
            await loadContacts();
            setContactsLoading(false);
        } else {
            Alert.alert('Permission Denied', 'Cannot access contacts');
        }
    };

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

    const getUserDetails = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const fullName = `${userData.firstName} ${userData.lastName}`;
                return {
                    fullName: fullName,
                    phoneNumber: userData.phoneNumber,
                };
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.log('Error getting document:', error);
        }
        return { fullName: 'Unknown', phoneNumber: 'Unknown' }; // Fallback in case of an error
    };

    const handleAddParticipants = (group) => {
        setCurrentGroup(group);
        setModalVisible(true);
    };

    const loadContacts = async () => {
        const { data } = await Contacts.getContactsAsync();
        if (data.length > 0) {
            // Filter out contacts without a phone number
            const contactsWithPhoneNumbers = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
    
            // Sorting contacts A-Z for English names and א-ת for Hebrew names
            const sortedData = contactsWithPhoneNumbers.sort((a, b) => {
                const nameA = getContactName(a).toLowerCase();
                const nameB = getContactName(b).toLowerCase();
                
                // Check if the names are in Hebrew
                const isHebrewA = /[\u0590-\u05FF]/.test(nameA);
                const isHebrewB = /[\u0590-\u05FF]/.test(nameB);
    
                if (isHebrewA && isHebrewB) {
                    // Both names are Hebrew
                    return nameA.localeCompare(nameB, 'he');
                } else if (!isHebrewA && !isHebrewB) {
                    // Both names are not Hebrew
                    return nameA.localeCompare(nameB, 'en');
                } else {
                    // One name is Hebrew and the other is not
                    return isHebrewA ? 1 : -1;
                }
            });
    
            setContacts(sortedData);
            setFilteredContacts(sortedData);
        }
    };

    const toggleContactSelection = (contactId) => {
        if (tempSelectedContacts.includes(contactId)) {
            setTempSelectedContacts(tempSelectedContacts.filter(id => id !== contactId));
        } else {
            setTempSelectedContacts([...tempSelectedContacts, contactId]);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text) {
            const filtered = contacts.filter(contact => {
                const contactName = getContactName(contact);
                return contactName.toLowerCase().includes(text.toLowerCase());
            });
            setFilteredContacts(filtered);
        } else {
            setFilteredContacts(contacts);
        }
    };

    const handleConfirm = async () => {
        if (!currentGroup) return;

        const normalizePhoneNumber = (phone) => {
            return phone.replace(/[-\s]/g, '').replace(/^(\+972|0)/, '+972');
        };

        const selectedContactDetails = tempSelectedContacts.map(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            const contactPhone = contact.phoneNumbers[0].number;
            return { id: contactId, phone: normalizePhoneNumber(contactPhone) };
        });

        setModalVisible(false); // Close the modal immediately

        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const matchedUids = [];
        const unmatchedContacts = [];

        selectedContactDetails.forEach(contact => {
            const matchedUser = users.find(user => {
                const userPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
                return userPhone === contact.phone;
            });
            if (matchedUser) {
                matchedUids.push(matchedUser.id);
            } else {
                unmatchedContacts.push(contact.id);
            }
        });

        try {
            if (matchedUids.length > 0) {
                const groupDocRef = doc(db, 'groups', currentGroup.id);
                await updateDoc(groupDocRef, { participants: arrayUnion(...matchedUids) });

                const updateParticipantsPromises = matchedUids.map(async (participantUid) => {
                    const participantDocRef = doc(db, 'users', participantUid);
                    await updateDoc(participantDocRef, {
                        groups: arrayUnion(currentGroup.id)
                    });
                });
                await Promise.all(updateParticipantsPromises);

                setGroups(groups.map(group => {
                    if (group.id === currentGroup.id) {
                        const updatedParticipants = [...group.participants, ...matchedUids];
                        const updatedParticipantsDetails = [...group.participantsDetails, ...matchedUids.map(uid => {
                            const matchedUser = users.find(user => user.id === uid);
                            return {
                                id: uid,
                                fullName: `${matchedUser.firstName} ${matchedUser.lastName}`,
                                phoneNumber: matchedUser.phoneNumber
                            };
                        })];
                        return { ...group, participants: updatedParticipants, participantsDetails: updatedParticipantsDetails };
                    }
                    return group;
                }));

                Alert.alert('Success', 'Participants added successfully');
            } else {
                Alert.alert('No Matches', 'No contacts matched existing users.');
                setModalVisible(true); // Reopen the modal if no matches
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add participants');
            setModalVisible(true); // Reopen the modal if there's an error
        }

        setTempSelectedContacts([]);
        setSearchQuery('');
        setFilteredContacts(contacts);
        setCurrentGroup(null);
    };

    const handleCancel = () => {
        setTempSelectedContacts([]);
        setSearchQuery('');
        setFilteredContacts(contacts);
        setModalVisible(false);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredContacts(contacts);
    };

    const getContactName = (contact) => {
        if (contact.name) return contact.name;
        if (contact.firstName && contact.middleName && contact.lastName) return `${contact.firstName} ${contact.middleName} ${contact.lastName}`;
        if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
        if (contact.firstName) return contact.firstName;
        if (contact.lastName) return contact.lastName;
        return 'No Name';
    };

    const GroupItem = ({ item }) => {
        return (
            <View>
                <View style={styles.tableRow}>
                    <Text style={styles.groupName}>{item.groupName}</Text>
                    <View style={styles.icons}>
                        <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
                            <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
                            <Icon name="plus" size={25} color="grey" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
                            <Icon name="trash" size={25} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
                {expandedGroup === item.id && (
                    <View style={styles.participantsList}>
                        {item.participantsDetails?.map((participant, idx) => (
                            <View
                                key={participant.id}
                                style={[
                                    styles.participantRow,
                                    idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
                                ]}
                            >
                                <Text style={styles.numberCell}>{idx + 1}.</Text>
                                <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
                                    {participant.fullName}
                                </Text>
                                <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Groups</Text>
            {groupsLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={groups}
                    renderItem={({ item }) => <GroupItem item={item} />}
                    keyExtractor={(item) => item.id}
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={handleCancel}
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.searchContainer}>
                            <Icon name="search" size={20} color="grey" style={styles.searchIcon} />
                            <TextInput 
                                style={[styles.searchBar, { textAlign: searchQuery && /[\u0590-\u05FF]/.test(searchQuery[0]) ? 'right' : 'left' }]}
                                placeholder="Search contacts"
                                placeholderTextColor="grey"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                            {searchQuery ? (
                                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                                    <Icon name="times-circle" size={20} color="grey" style={styles.clearIcon} />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        {contactsLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <FlatList
                                data={filteredContacts}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    const contactName = getContactName(item);
                                    const contactPhone = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'No phone number';
                                    const isSelected = tempSelectedContacts.includes(item.id);
                                    return (
                                        <TouchableOpacity 
                                            style={[styles.contactItem, isSelected ? styles.selected : null]} 
                                            onPress={() => toggleContactSelection(item.id)}
                                        >
                                            <Text style={styles.contactName}>
                                                {contactName}
                                            </Text>
                                            <Text style={styles.contactPhone}>
                                                {contactPhone}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
                                <Text style={styles.buttonText}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    participantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    numberCell: {
        width: 20, // Adjust the width as needed
        textAlign: 'right',
    },
    participantName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10, // Adjust the margin as needed
    },
    participant: {
        fontSize: 16,
        paddingVertical: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: 10,
        zIndex: 1,
    },
    searchBar: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 40, // to make room for the search icon
        paddingRight: 40, // to make room for the clear icon
    },
    clearButton: {
        position: 'absolute',
        right: 10,
        zIndex: 1,
    },
    clearIcon: {
        marginHorizontal: 5,
    },
    contactItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    contactName: {
        fontSize: 16, // Adjust the size as needed
        fontWeight: 'bold',
    },
    selected: {
        backgroundColor: '#d3d3d3',
    },
    contactPhone: {
        color: 'grey',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default GroupList;

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
// import { db, auth, storage } from '../../../firebaseConfig';
// import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDoc } from 'firebase/firestore';
// import { ref, deleteObject } from 'firebase/storage';
// import * as Contacts from 'expo-contacts';
// import Icon from 'react-native-vector-icons/FontAwesome';

// const GroupList = () => {
//     const [groups, setGroups] = useState([]);
//     const [expandedGroup, setExpandedGroup] = useState(null);
//     const [modalVisible, setModalVisible] = useState(false);
//     const [contacts, setContacts] = useState([]);
//     const [filteredContacts, setFilteredContacts] = useState([]);
//     const [selectedContacts, setSelectedContacts] = useState([]);
//     const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
//     const [permissionGranted, setPermissionGranted] = useState(false);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [currentGroup, setCurrentGroup] = useState(null);

//     const user = auth.currentUser;

//     useEffect(() => {
//         fetchGroups();
//     }, []);

//     const fetchGroups = async () => {
//         const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
//         const querySnapshot = await getDocs(q);
//         const groupsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
//             const groupData = { id: doc.id, ...doc.data() };
//             const participants = await Promise.all(groupData.participants.map(async (participantId) => {
//                 if (participantId === user.uid) {
//                     return { fullName: 'Me', phoneNumber: user.phoneNumber, id: participantId };
//                 }
//                 const details = await getUserDetails(participantId);
//                 return { ...details, id: participantId };
//             }));
//             // Move the current user to the first position
//             const currentUserIndex = participants.findIndex(p => p.id === user.uid);
//             if (currentUserIndex > -1) {
//                 const currentUser = participants.splice(currentUserIndex, 1)[0];
//                 participants.unshift(currentUser);
//             }
//             groupData.participantsDetails = participants;
//             return groupData;
//         }));
//         setGroups(groupsList);
//     };

//     const toggleGroup = (groupId) => {
//         setExpandedGroup(expandedGroup === groupId ? null : groupId);
//     };

//     const handleDeleteGroup = async (group) => {
//         Alert.alert(
//             'Confirm Delete',
//             'Are you sure you want to exit and delete the group?',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Yes',
//                     onPress: async () => {
//                         try {
//                             const userDocRef = doc(db, 'users', user.uid);
//                             await updateDoc(userDocRef, {
//                                 groups: arrayRemove(group.id)
//                             });

//                             if (group.participants.length === 1) {
//                                 // Delete group and associated data
//                                 await deleteDoc(doc(db, 'groups', group.id));
//                                 const storageRef = ref(storage, `groupPic/${group.id}`);
//                                 await deleteObject(storageRef);
//                             } else {
//                                 // Remove user from group participants
//                                 const groupDocRef = doc(db, 'groups', group.id);
//                                 await updateDoc(groupDocRef, {
//                                     participants: arrayRemove(user.uid)
//                                 });
//                             }

//                             setGroups(groups.filter(g => g.id !== group.id));
//                             Alert.alert('Success', 'Group deleted successfully');
//                         } catch (error) {
//                             console.log('Error deleting group:', error);
//                             Alert.alert('Error', 'Failed to delete group', error);
//                         }
//                     },
//                 },
//             ]
//         );
//     };

//     const getUserDetails = async (userId) => {
//         try {
//             const userDoc = await getDoc(doc(db, 'users', userId));
//             if (userDoc.exists()) {
//                 const userData = userDoc.data();
//                 const fullName = `${userData.firstName} ${userData.lastName}`;
//                 return {
//                     fullName: fullName,
//                     phoneNumber: userData.phoneNumber,
//                 };
//             } else {
//                 console.log('No such document!');
//             }
//         } catch (error) {
//             console.log('Error getting document:', error);
//         }
//         return { fullName: 'Unknown', phoneNumber: 'Unknown' }; // Fallback in case of an error
//     };

//     const handleAddParticipants = async (group) => {
//         setCurrentGroup(group);
//         await requestContactsPermission();
//         loadContacts(); // Load contacts immediately when modal is opened
//         setModalVisible(true);
//     };

//     const requestContactsPermission = async () => {
//         const { status } = await Contacts.requestPermissionsAsync();
//         if (status === 'granted') {
//             setPermissionGranted(true);
//         } else {
//             Alert.alert('Permission Denied', 'Cannot access contacts');
//         }
//     };

//     const loadContacts = async () => {
//         const { data } = await Contacts.getContactsAsync();
//         if (data.length > 0) {
//             // Filter out contacts without a phone number
//             const contactsWithPhoneNumbers = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
    
//             // Sorting contacts A-Z for English names and א-ת for Hebrew names
//             const sortedData = contactsWithPhoneNumbers.sort((a, b) => {
//                 const nameA = getContactName(a).toLowerCase();
//                 const nameB = getContactName(b).toLowerCase();
                
//                 // Check if the names are in Hebrew
//                 const isHebrewA = /[\u0590-\u05FF]/.test(nameA);
//                 const isHebrewB = /[\u0590-\u05FF]/.test(nameB);
    
//                 if (isHebrewA && isHebrewB) {
//                     // Both names are Hebrew
//                     return nameA.localeCompare(nameB, 'he');
//                 } else if (!isHebrewA && !isHebrewB) {
//                     // Both names are not Hebrew
//                     return nameA.localeCompare(nameB, 'en');
//                 } else {
//                     // One name is Hebrew and the other is not
//                     return isHebrewA ? 1 : -1;
//                 }
//             });
    
//             setContacts(sortedData);
//             setFilteredContacts(sortedData);
//         }
//     };

//     const toggleContactSelection = (contactId) => {
//         if (tempSelectedContacts.includes(contactId)) {
//             setTempSelectedContacts(tempSelectedContacts.filter(id => id !== contactId));
//         } else {
//             setTempSelectedContacts([...tempSelectedContacts, contactId]);
//         }
//     };

//     const handleSearch = (text) => {
//         setSearchQuery(text);
//         if (text) {
//             const filtered = contacts.filter(contact => {
//                 const contactName = getContactName(contact);
//                 return contactName.toLowerCase().includes(text.toLowerCase());
//             });
//             setFilteredContacts(filtered);
//         } else {
//             setFilteredContacts(contacts);
//         }
//     };

//     const handleConfirm = async () => {
//         if (!currentGroup) return;

//         const normalizePhoneNumber = (phone) => {
//             return phone.replace(/[-\s]/g, '').replace(/^(\+972|0)/, '+972');
//         };

//         const selectedContactDetails = tempSelectedContacts.map(contactId => {
//             const contact = contacts.find(c => c.id === contactId);
//             const contactPhone = contact.phoneNumbers[0].number;
//             return { id: contactId, phone: normalizePhoneNumber(contactPhone) };
//         });

//         setModalVisible(false); // Close the modal immediately

//         const usersSnapshot = await getDocs(collection(db, 'users'));
//         const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//         const matchedUids = [];
//         const unmatchedContacts = [];

//         selectedContactDetails.forEach(contact => {
//             const matchedUser = users.find(user => {
//                 const userPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
//                 return userPhone === contact.phone;
//             });
//             if (matchedUser) {
//                 matchedUids.push(matchedUser.id);
//             } else {
//                 unmatchedContacts.push(contact.id);
//             }
//         });

//         try {
//             if (matchedUids.length > 0) {
//                 const groupDocRef = doc(db, 'groups', currentGroup.id);
//                 await updateDoc(groupDocRef, { participants: arrayUnion(...matchedUids) });

//                 const updateParticipantsPromises = matchedUids.map(async (participantUid) => {
//                     const participantDocRef = doc(db, 'users', participantUid);
//                     await updateDoc(participantDocRef, {
//                         groups: arrayUnion(currentGroup.id)
//                     });
//                 });
//                 await Promise.all(updateParticipantsPromises);

//                 setGroups(groups.map(group => {
//                     if (group.id === currentGroup.id) {
//                         const updatedParticipants = [...group.participants, ...matchedUids];
//                         const updatedParticipantsDetails = [...group.participantsDetails, ...matchedUids.map(uid => {
//                             const matchedUser = users.find(user => user.id === uid);
//                             return {
//                                 id: uid,
//                                 fullName: `${matchedUser.firstName} ${matchedUser.lastName}`,
//                                 phoneNumber: matchedUser.phoneNumber
//                             };
//                         })];
//                         return { ...group, participants: updatedParticipants, participantsDetails: updatedParticipantsDetails };
//                     }
//                     return group;
//                 }));

//                 Alert.alert('Success', 'Participants added successfully');
//             } else {
//                 Alert.alert('No Matches', 'No contacts matched existing users.');
//                 setModalVisible(true); // Reopen the modal if no matches
//             }
//         } catch (error) {
//             Alert.alert('Error', 'Failed to add participants');
//             setModalVisible(true); // Reopen the modal if there's an error
//         }

//         setTempSelectedContacts([]);
//         setSearchQuery('');
//         setFilteredContacts(contacts);
//         setCurrentGroup(null);
//     };

//     const handleCancel = () => {
//         setTempSelectedContacts([]);
//         setSearchQuery('');
//         setFilteredContacts(contacts);
//         setModalVisible(false);
//     };

//     const clearSearch = () => {
//         setSearchQuery('');
//         setFilteredContacts(contacts);
//     };

//     const getContactName = (contact) => {
//         if (contact.name) return contact.name;
//         if (contact.firstName && contact.middleName && contact.lastName) return `${contact.firstName} ${contact.middleName} ${contact.lastName}`;
//         if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
//         if (contact.firstName) return contact.firstName;
//         if (contact.lastName) return contact.lastName;
//         return 'No Name';
//     };

//     const GroupItem = ({ item }) => {
//         return (
//             <View>
//                 <View style={styles.tableRow}>
//                     <Text style={styles.groupName}>{item.groupName}</Text>
//                     <View style={styles.icons}>
//                         <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
//                             <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
//                             <Icon name="plus" size={25} color="grey" />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
//                             <Icon name="trash" size={25} color="red" />
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//                 {expandedGroup === item.id && (
//                     <View style={styles.participantsList}>
//                         {item.participantsDetails?.map((participant, idx) => (
//                             <View
//                                 key={participant.id}
//                                 style={[
//                                     styles.participantRow,
//                                     idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
//                                 ]}
//                             >
//                                 <Text style={styles.numberCell}>{idx + 1}.</Text>
//                                 <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
//                                     {participant.fullName}
//                                 </Text>
//                                 <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
//                             </View>
//                         ))}
//                     </View>
//                 )}
//             </View>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>My Groups</Text>
//             <FlatList
//                 data={groups}
//                 renderItem={({ item }) => <GroupItem item={item} />}
//                 keyExtractor={(item) => item.id}
//             />

//             <Modal
//                 visible={modalVisible}
//                 animationType="slide"
//                 onRequestClose={handleCancel}
//                 transparent={true}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContainer}>
//                         <View style={styles.searchContainer}>
//                             <Icon name="search" size={20} color="grey" style={styles.searchIcon} />
//                             <TextInput 
//                                 style={[styles.searchBar, { textAlign: searchQuery && /[\u0590-\u05FF]/.test(searchQuery[0]) ? 'right' : 'left' }]}
//                                 placeholder="Search contacts"
//                                 placeholderTextColor="grey"
//                                 value={searchQuery}
//                                 onChangeText={handleSearch}
//                             />
//                             {searchQuery ? (
//                                 <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
//                                     <Icon name="times-circle" size={20} color="grey" style={styles.clearIcon} />
//                                 </TouchableOpacity>
//                             ) : null}
//                         </View>
//                         <FlatList
//                             data={filteredContacts}
//                             keyExtractor={(item) => item.id}
//                             renderItem={({ item }) => {
//                                 const contactName = getContactName(item);
//                                 const contactPhone = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'No phone number';
//                                 const isSelected = tempSelectedContacts.includes(item.id);
//                                 return (
//                                     <TouchableOpacity 
//                                         style={[styles.contactItem, isSelected ? styles.selected : null]} 
//                                         onPress={() => toggleContactSelection(item.id)}
//                                     >
//                                         <Text style={styles.contactName}>
//                                             {contactName}
//                                         </Text>
//                                         <Text style={styles.contactPhone}>
//                                             {contactPhone}
//                                         </Text>
//                                     </TouchableOpacity>
//                                 );
//                             }}
//                         />
//                         <View style={styles.modalButtons}>
//                             <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
//                                 <Text style={styles.buttonText}>Cancel</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
//                                 <Text style={styles.buttonText}>Confirm</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 16,
//         textAlign: 'center',
//     },
//     tableRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//         alignItems: 'center',
//     },
//     tableCell: {
//         flex: 2,
//         textAlign: 'left',
//         marginLeft: 10, // Move the number and name to the right
//     },
//     groupName: {
//         marginLeft: 15, // Add spacing between the number and the name
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     icons: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginRight: 15, // Move the icons to the left
//     },
//     iconButton: {
//         marginHorizontal: 10, // Add spacing between the icons
//     },
//     participantsList: {
//         paddingVertical: 10,
//         paddingLeft: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     participantRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     numberCell: {
//         width: 20, // Adjust the width as needed
//         textAlign: 'right',
//     },
//     participantName: {
//         fontWeight: 'bold',
//         fontSize: 16,
//         marginLeft: 10, // Adjust the margin as needed
//     },
//     participant: {
//         fontSize: 16,
//         paddingVertical: 2,
//     },
//     modalOverlay: {
//         flex: 1,
//         justifyContent: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     modalContainer: {
//         backgroundColor: '#fff',
//         marginHorizontal: 20,
//         borderRadius: 10,
//         padding: 20,
//         maxHeight: '80%',
//     },
//     searchContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//         position: 'relative',
//     },
//     searchIcon: {
//         position: 'absolute',
//         left: 10,
//         zIndex: 1,
//     },
//     searchBar: {
//         flex: 1,
//         height: 40,
//         borderColor: '#ccc',
//         borderWidth: 1,
//         borderRadius: 5,
//         paddingLeft: 40, // to make room for the search icon
//         paddingRight: 40, // to make room for the clear icon
//     },
//     clearButton: {
//         position: 'absolute',
//         right: 10,
//         zIndex: 1,
//     },
//     clearIcon: {
//         marginHorizontal: 5,
//     },
//     contactItem: {
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
//     },
//     contactName: {
//         fontSize: 16, // Adjust the size as needed
//         fontWeight: 'bold',
//     },
//     selected: {
//         backgroundColor: '#d3d3d3',
//     },
//     contactPhone: {
//         color: 'grey',
//     },
//     modalButtons: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingTop: 10,
//     },
//     modalButton: {
//         flex: 1,
//         marginHorizontal: 5,
//         padding: 10,
//         backgroundColor: '#007bff',
//         borderRadius: 5,
//         alignItems: 'center',
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//     },
// });

// export default GroupList;

// // import React, { useEffect, useState } from 'react';
// // import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
// // import { db, auth, storage } from '../../../firebaseConfig';
// // import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDoc } from 'firebase/firestore';
// // import { ref, deleteObject } from 'firebase/storage';
// // import * as Contacts from 'expo-contacts';
// // import Icon from 'react-native-vector-icons/FontAwesome';

// // const GroupList = () => {
// //     const [groups, setGroups] = useState([]);
// //     const [expandedGroup, setExpandedGroup] = useState(null);
// //     const [modalVisible, setModalVisible] = useState(false);
// //     const [contacts, setContacts] = useState([]);
// //     const [filteredContacts, setFilteredContacts] = useState([]);
// //     const [selectedContacts, setSelectedContacts] = useState([]);
// //     const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
// //     const [permissionGranted, setPermissionGranted] = useState(false);
// //     const [searchQuery, setSearchQuery] = useState('');
// //     const [currentGroup, setCurrentGroup] = useState(null);

// //     const user = auth.currentUser;

// //     useEffect(() => {
// //         const fetchGroups = async () => {
// //             const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
// //             const querySnapshot = await getDocs(q);
// //             const groupsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
// //                 const groupData = { id: doc.id, ...doc.data() };
// //                 const participants = await Promise.all(groupData.participants.map(async (participantId) => {
// //                     if (participantId === user.uid) {
// //                         return { fullName: 'Me', phoneNumber: user.phoneNumber, id: participantId };
// //                     }
// //                     const details = await getUserDetails(participantId);
// //                     return { ...details, id: participantId };
// //                 }));
// //                 // Move the current user to the first position
// //                 const currentUserIndex = participants.findIndex(p => p.id === user.uid);
// //                 if (currentUserIndex > -1) {
// //                     const currentUser = participants.splice(currentUserIndex, 1)[0];
// //                     participants.unshift(currentUser);
// //                 }
// //                 groupData.participantsDetails = participants;
// //                 return groupData;
// //             }));
// //             setGroups(groupsList);
// //         };

// //         fetchGroups();
// //     }, []);

// //     const toggleGroup = (groupId) => {
// //         setExpandedGroup(expandedGroup === groupId ? null : groupId);
// //     };

// //     const handleDeleteGroup = async (group) => {
// //         Alert.alert(
// //             'Confirm Delete',
// //             'Are you sure you want to exit and delete the group?',
// //             [
// //                 { text: 'Cancel', style: 'cancel' },
// //                 {
// //                     text: 'Yes',
// //                     onPress: async () => {
// //                         try {
// //                             const userDocRef = doc(db, 'users', user.uid);
// //                             await updateDoc(userDocRef, {
// //                                 groups: arrayRemove(group.id)
// //                             });

// //                             if (group.participants.length === 1) {
// //                                 // Delete group and associated data
// //                                 await deleteDoc(doc(db, 'groups', group.id));
// //                                 const storageRef = ref(storage, `groupPic/${group.id}`);
// //                                 await deleteObject(storageRef);
// //                             } else {
// //                                 // Remove user from group participants
// //                                 const groupDocRef = doc(db, 'groups', group.id);
// //                                 await updateDoc(groupDocRef, {
// //                                     participants: arrayRemove(user.uid)
// //                                 });
// //                             }

// //                             setGroups(groups.filter(g => g.id !== group.id));
// //                             Alert.alert('Success', 'Group deleted successfully');
// //                         } catch (error) {
// //                             console.log('Error deleting group:', error);
// //                             Alert.alert('Error', 'Failed to delete group', error);
// //                         }
// //                     },
// //                 },
// //             ]
// //         );
// //     };

// //     const getUserDetails = async (userId) => {
// //         try {
// //             const userDoc = await getDoc(doc(db, 'users', userId));
// //             if (userDoc.exists()) {
// //                 const userData = userDoc.data();
// //                 const fullName = `${userData.firstName} ${userData.lastName}`;
// //                 return {
// //                     fullName: fullName,
// //                     phoneNumber: userData.phoneNumber,
// //                 };
// //             } else {
// //                 console.log('No such document!');
// //             }
// //         } catch (error) {
// //             console.log('Error getting document:', error);
// //         }
// //         return { fullName: 'Unknown', phoneNumber: 'Unknown' }; // Fallback in case of an error
// //     };

// //     const handleAddParticipants = async (group) => {
// //         setCurrentGroup(group);
// //         requestContactsPermission();
// //     };

// //     const requestContactsPermission = async () => {
// //         const { status } = await Contacts.requestPermissionsAsync();
// //         if (status === 'granted') {
// //             setPermissionGranted(true);
// //             loadContacts();
// //             setModalVisible(true);
// //         } else {
// //             Alert.alert('Permission Denied', 'Cannot access contacts');
// //         }
// //     };

// //     const loadContacts = async () => {
// //         const { data } = await Contacts.getContactsAsync();
// //         if (data.length > 0) {
// //             // Filter out contacts without a phone number
// //             const contactsWithPhoneNumbers = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
    
// //             // Sorting contacts A-Z for English names and א-ת for Hebrew names
// //             const sortedData = contactsWithPhoneNumbers.sort((a, b) => {
// //                 const nameA = getContactName(a).toLowerCase();
// //                 const nameB = getContactName(b).toLowerCase();
                
// //                 // Check if the names are in Hebrew
// //                 const isHebrewA = /[\u0590-\u05FF]/.test(nameA);
// //                 const isHebrewB = /[\u0590-\u05FF]/.test(nameB);
    
// //                 if (isHebrewA && isHebrewB) {
// //                     // Both names are Hebrew
// //                     return nameA.localeCompare(nameB, 'he');
// //                 } else if (!isHebrewA && !isHebrewB) {
// //                     // Both names are not Hebrew
// //                     return nameA.localeCompare(nameB, 'en');
// //                 } else {
// //                     // One name is Hebrew and the other is not
// //                     return isHebrewA ? 1 : -1;
// //                 }
// //             });
    
// //             setContacts(sortedData);
// //             setFilteredContacts(sortedData);
// //         }
// //     };

// //     const toggleContactSelection = (contactId) => {
// //         if (tempSelectedContacts.includes(contactId)) {
// //             setTempSelectedContacts(tempSelectedContacts.filter(id => id !== contactId));
// //         } else {
// //             setTempSelectedContacts([...tempSelectedContacts, contactId]);
// //         }
// //     };

// //     const handleSearch = (text) => {
// //         setSearchQuery(text);
// //         if (text) {
// //             const filtered = contacts.filter(contact => {
// //                 const contactName = getContactName(contact);
// //                 return contactName.toLowerCase().includes(text.toLowerCase());
// //             });
// //             setFilteredContacts(filtered);
// //         } else {
// //             setFilteredContacts(contacts);
// //         }
// //     };

// //     const handleConfirm = async () => {
// //         if (!currentGroup) return;

// //         const normalizePhoneNumber = (phone) => {
// //             return phone.replace(/[-\s]/g, '').replace(/^(\+972|0)/, '+972');
// //         };

// //         const selectedContactDetails = tempSelectedContacts.map(contactId => {
// //             const contact = contacts.find(c => c.id === contactId);
// //             const contactPhone = contact.phoneNumbers[0].number;
// //             return { id: contactId, phone: normalizePhoneNumber(contactPhone) };
// //         });

// //         const usersSnapshot = await getDocs(collection(db, 'users'));
// //         const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// //         const matchedUids = [];
// //         const unmatchedContacts = [];

// //         selectedContactDetails.forEach(contact => {
// //             const matchedUser = users.find(user => {
// //                 const userPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
// //                 return userPhone === contact.phone;
// //             });
// //             if (matchedUser) {
// //                 matchedUids.push(matchedUser.id);
// //             } else {
// //                 unmatchedContacts.push(contact.id);
// //             }
// //         });

// //         if (matchedUids.length > 0) {
// //             const groupDocRef = doc(db, 'groups', currentGroup.id);
// //             await updateDoc(groupDocRef, { participants: arrayUnion(...matchedUids) });

// //             const updateParticipantsPromises = matchedUids.map(async (participantUid) => {
// //                 const participantDocRef = doc(db, 'users', participantUid);
// //                 await updateDoc(participantDocRef, {
// //                     groups: arrayUnion(currentGroup.id)
// //                 });
// //             });
// //             await Promise.all(updateParticipantsPromises);

// //             setGroups(groups.map(group => {
// //                 if (group.id === currentGroup.id) {
// //                     const updatedParticipants = [...group.participants, ...matchedUids];
// //                     const updatedParticipantsDetails = [...group.participantsDetails, ...matchedUids.map(uid => {
// //                         const matchedUser = users.find(user => user.id === uid);
// //                         return {
// //                             id: uid,
// //                             fullName: `${matchedUser.firstName} ${matchedUser.lastName}`,
// //                             phoneNumber: matchedUser.phoneNumber
// //                         };
// //                     })];
// //                     return { ...group, participants: updatedParticipants, participantsDetails: updatedParticipantsDetails };
// //                 }
// //                 return group;
// //             }));

// //             Alert.alert('Success', 'Participants added successfully');
// //         } else {
// //             Alert.alert('No Matches', 'No contacts matched existing users.');
// //         }

// //         setTempSelectedContacts([]);
// //         setSearchQuery('');
// //         setFilteredContacts(contacts);
// //         setModalVisible(false);
// //         setCurrentGroup(null);
// //     };

// //     const handleCancel = () => {
// //         setTempSelectedContacts([]);
// //         setSearchQuery('');
// //         setFilteredContacts(contacts);
// //         setModalVisible(false);
// //     };

// //     const clearSearch = () => {
// //         setSearchQuery('');
// //         setFilteredContacts(contacts);
// //     };

// //     const getContactName = (contact) => {
// //         if (contact.name) return contact.name;
// //         if (contact.firstName && contact.middleName && contact.lastName) return `${contact.firstName} ${contact.middleName} ${contact.lastName}`;
// //         if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
// //         if (contact.firstName) return contact.firstName;
// //         if (contact.lastName) return contact.lastName;
// //         return 'No Name';
// //     };

// //     const GroupItem = ({ item }) => {
// //         return (
// //             <View>
// //                 <View style={styles.tableRow}>
// //                     <Text style={styles.groupName}>{item.groupName}</Text>
// //                     <View style={styles.icons}>
// //                         <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
// //                             <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
// //                         </TouchableOpacity>
// //                         <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
// //                             <Icon name="plus" size={25} color="grey" />
// //                         </TouchableOpacity>
// //                         <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
// //                             <Icon name="trash" size={25} color="red" />
// //                         </TouchableOpacity>
// //                     </View>
// //                 </View>
// //                 {expandedGroup === item.id && (
// //                     <View style={styles.participantsList}>
// //                         {item.participantsDetails?.map((participant, idx) => (
// //                             <View
// //                                 key={participant.id}
// //                                 style={[
// //                                     styles.participantRow,
// //                                     idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
// //                                 ]}
// //                             >
// //                                 <Text style={styles.numberCell}>{idx + 1}.</Text>
// //                                 <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
// //                                     {participant.fullName}
// //                                 </Text>
// //                                 <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
// //                             </View>
// //                         ))}
// //                     </View>
// //                 )}
// //             </View>
// //         );
// //     };

// //     return (
// //         <View style={styles.container}>
// //             <Text style={styles.title}>My Groups</Text>
// //             <FlatList
// //                 data={groups}
// //                 renderItem={({ item }) => <GroupItem item={item} />}
// //                 keyExtractor={(item) => item.id}
// //             />

// //             <Modal
// //                 visible={modalVisible}
// //                 animationType="slide"
// //                 onRequestClose={handleCancel}
// //                 transparent={true}
// //             >
// //                 <View style={styles.modalOverlay}>
// //                     <View style={styles.modalContainer}>
// //                         <View style={styles.searchContainer}>
// //                             <Icon name="search" size={20} color="grey" style={styles.searchIcon} />
// //                             <TextInput 
// //                                 style={[styles.searchBar, { textAlign: searchQuery && /[\u0590-\u05FF]/.test(searchQuery[0]) ? 'right' : 'left' }]}
// //                                 placeholder="Search contacts"
// //                                 placeholderTextColor="grey"
// //                                 value={searchQuery}
// //                                 onChangeText={handleSearch}
// //                             />
// //                             {searchQuery ? (
// //                                 <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
// //                                     <Icon name="times-circle" size={20} color="grey" style={styles.clearIcon} />
// //                                 </TouchableOpacity>
// //                             ) : null}
// //                         </View>
// //                         <FlatList
// //                             data={filteredContacts}
// //                             keyExtractor={(item) => item.id}
// //                             renderItem={({ item }) => {
// //                                 const contactName = getContactName(item);
// //                                 const contactPhone = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'No phone number';
// //                                 const isSelected = tempSelectedContacts.includes(item.id);
// //                                 return (
// //                                     <TouchableOpacity 
// //                                         style={[styles.contactItem, isSelected ? styles.selected : null]} 
// //                                         onPress={() => toggleContactSelection(item.id)}
// //                                     >
// //                                         <Text style={styles.contactName}>
// //                                             {contactName}
// //                                         </Text>
// //                                         <Text style={styles.contactPhone}>
// //                                             {contactPhone}
// //                                         </Text>
// //                                     </TouchableOpacity>
// //                                 );
// //                             }}
// //                         />
// //                         <View style={styles.modalButtons}>
// //                             <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
// //                                 <Text style={styles.buttonText}>Cancel</Text>
// //                             </TouchableOpacity>
// //                             <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
// //                                 <Text style={styles.buttonText}>Confirm</Text>
// //                             </TouchableOpacity>
// //                         </View>
// //                     </View>
// //                 </View>
// //             </Modal>
// //         </View>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         padding: 16,
// //         backgroundColor: '#fff',
// //     },
// //     title: {
// //         fontSize: 24,
// //         fontWeight: 'bold',
// //         marginBottom: 16,
// //         textAlign: 'center',
// //     },
// //     tableRow: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         paddingVertical: 10,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#ccc',
// //         alignItems: 'center',
// //     },
// //     tableCell: {
// //         flex: 2,
// //         textAlign: 'left',
// //         marginLeft: 10, // Move the number and name to the right
// //     },
// //     groupName: {
// //         marginLeft: 15, // Add spacing between the number and the name
// //         fontWeight: 'bold',
// //         fontSize: 16,
// //     },
// //     icons: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         marginRight: 15, // Move the icons to the left
// //     },
// //     iconButton: {
// //         marginHorizontal: 10, // Add spacing between the icons
// //     },
// //     participantsList: {
// //         paddingVertical: 10,
// //         paddingLeft: 20,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#ccc',
// //     },
// //     participantRow: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         paddingVertical: 10,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#ccc',
// //     },
// //     numberCell: {
// //         width: 20, // Adjust the width as needed
// //         textAlign: 'right',
// //     },
// //     participantName: {
// //         fontWeight: 'bold',
// //         fontSize: 16,
// //         marginLeft: 10, // Adjust the margin as needed
// //     },
// //     participant: {
// //         fontSize: 16,
// //         paddingVertical: 2,
// //     },
// //     modalOverlay: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         backgroundColor: 'rgba(0, 0, 0, 0.5)',
// //     },
// //     modalContainer: {
// //         backgroundColor: '#fff',
// //         marginHorizontal: 20,
// //         borderRadius: 10,
// //         padding: 20,
// //         maxHeight: '80%',
// //     },
// //     searchContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         marginBottom: 20,
// //         position: 'relative',
// //     },
// //     searchIcon: {
// //         position: 'absolute',
// //         left: 10,
// //         zIndex: 1,
// //     },
// //     searchBar: {
// //         flex: 1,
// //         height: 40,
// //         borderColor: '#ccc',
// //         borderWidth: 1,
// //         borderRadius: 5,
// //         paddingLeft: 40, // to make room for the search icon
// //         paddingRight: 40, // to make room for the clear icon
// //     },
// //     clearButton: {
// //         position: 'absolute',
// //         right: 10,
// //         zIndex: 1,
// //     },
// //     clearIcon: {
// //         marginHorizontal: 5,
// //     },
// //     contactItem: {
// //         padding: 10,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#ccc',
// //     },
// //     contactName: {
// //         fontSize: 16, // Adjust the size as needed
// //         fontWeight: 'bold',
// //     },
// //     selected: {
// //         backgroundColor: '#d3d3d3',
// //     },
// //     contactPhone: {
// //         color: 'grey',
// //     },
// //     modalButtons: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         paddingTop: 10,
// //     },
// //     modalButton: {
// //         flex: 1,
// //         marginHorizontal: 5,
// //         padding: 10,
// //         backgroundColor: '#007bff',
// //         borderRadius: 5,
// //         alignItems: 'center',
// //     },
// //     buttonText: {
// //         color: '#fff',
// //         fontSize: 16,
// //     },
// // });

// // export default GroupList;

// // // import React, { useEffect, useState } from 'react';
// // // import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
// // // import { db, auth, storage } from '../../../firebaseConfig';
// // // import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDoc } from 'firebase/firestore';
// // // import { ref, deleteObject } from 'firebase/storage';
// // // import * as Contacts from 'expo-contacts';
// // // import Icon from 'react-native-vector-icons/FontAwesome';

// // // const GroupList = () => {
// // //     const [groups, setGroups] = useState([]);
// // //     const [expandedGroup, setExpandedGroup] = useState(null);
// // //     const [modalVisible, setModalVisible] = useState(false);
// // //     const [contacts, setContacts] = useState([]);
// // //     const [filteredContacts, setFilteredContacts] = useState([]);
// // //     const [selectedContacts, setSelectedContacts] = useState([]);
// // //     const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
// // //     const [permissionGranted, setPermissionGranted] = useState(false);
// // //     const [searchQuery, setSearchQuery] = useState('');
// // //     const [currentGroup, setCurrentGroup] = useState(null);

// // //     const user = auth.currentUser;

// // //     useEffect(() => {
// // //         const fetchGroups = async () => {
// // //             const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
// // //             const querySnapshot = await getDocs(q);
// // //             const groupsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
// // //                 const groupData = { id: doc.id, ...doc.data() };
// // //                 const participants = await Promise.all(groupData.participants.map(async (participantId) => {
// // //                     if (participantId === user.uid) {
// // //                         return { fullName: 'Me', phoneNumber: user.phoneNumber, id: participantId };
// // //                     }
// // //                     const details = await getUserDetails(participantId);
// // //                     return { ...details, id: participantId };
// // //                 }));
// // //                 // Move the current user to the first position
// // //                 const currentUserIndex = participants.findIndex(p => p.id === user.uid);
// // //                 if (currentUserIndex > -1) {
// // //                     const currentUser = participants.splice(currentUserIndex, 1)[0];
// // //                     participants.unshift(currentUser);
// // //                 }
// // //                 groupData.participantsDetails = participants;
// // //                 return groupData;
// // //             }));
// // //             setGroups(groupsList);
// // //         };

// // //         fetchGroups();
// // //     }, []);

// // //     const toggleGroup = (groupId) => {
// // //         setExpandedGroup(expandedGroup === groupId ? null : groupId);
// // //     };

// // //     const handleDeleteGroup = async (group) => {
// // //         Alert.alert(
// // //             'Confirm Delete',
// // //             'Are you sure you want to exit and delete the group?',
// // //             [
// // //                 { text: 'Cancel', style: 'cancel' },
// // //                 {
// // //                     text: 'Yes',
// // //                     onPress: async () => {
// // //                         try {
// // //                             const userDocRef = doc(db, 'users', user.uid);
// // //                             await updateDoc(userDocRef, {
// // //                                 groups: arrayRemove(group.id)
// // //                             });

// // //                             if (group.participants.length === 1) {
// // //                                 // Delete group and associated data
// // //                                 await deleteDoc(doc(db, 'groups', group.id));
// // //                                 const storageRef = ref(storage, `groupPic/${group.id}`);
// // //                                 await deleteObject(storageRef);
// // //                             } else {
// // //                                 // Remove user from group participants
// // //                                 const groupDocRef = doc(db, 'groups', group.id);
// // //                                 await updateDoc(groupDocRef, {
// // //                                     participants: arrayRemove(user.uid)
// // //                                 });
// // //                             }

// // //                             setGroups(groups.filter(g => g.id !== group.id));
// // //                             Alert.alert('Success', 'Group deleted successfully');
// // //                         } catch (error) {
// // //                             console.log('Error deleting group:', error);
// // //                             Alert.alert('Error', 'Failed to delete group', error);
// // //                         }
// // //                     },
// // //                 },
// // //             ]
// // //         );
// // //     };

// // //     const getUserDetails = async (userId) => {
// // //         try {
// // //             const userDoc = await getDoc(doc(db, 'users', userId));
// // //             if (userDoc.exists()) {
// // //                 const userData = userDoc.data();
// // //                 const fullName = `${userData.firstName} ${userData.lastName}`;
// // //                 return {
// // //                     fullName: fullName,
// // //                     phoneNumber: userData.phoneNumber,
// // //                 };
// // //             } else {
// // //                 console.log('No such document!');
// // //             }
// // //         } catch (error) {
// // //             console.log('Error getting document:', error);
// // //         }
// // //         return { fullName: 'Unknown', phoneNumber: 'Unknown' }; // Fallback in case of an error
// // //     };

// // //     const handleAddParticipants = async (group) => {
// // //         setCurrentGroup(group);
// // //         requestContactsPermission();
// // //     };

// // //     const requestContactsPermission = async () => {
// // //         const { status } = await Contacts.requestPermissionsAsync();
// // //         if (status === 'granted') {
// // //             setPermissionGranted(true);
// // //             loadContacts();
// // //             setTempSelectedContacts(selectedContacts);
// // //             setModalVisible(true);
// // //         } else {
// // //             Alert.alert('Permission Denied', 'Cannot access contacts');
// // //         }
// // //     };

// // //     const loadContacts = async () => {
// // //         const { data } = await Contacts.getContactsAsync();
// // //         if (data.length > 0) {
// // //             // Filter out contacts without a phone number
// // //             const contactsWithPhoneNumbers = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
    
// // //             // Sorting contacts A-Z for English names and א-ת for Hebrew names
// // //             const sortedData = contactsWithPhoneNumbers.sort((a, b) => {
// // //                 const nameA = getContactName(a).toLowerCase();
// // //                 const nameB = getContactName(b).toLowerCase();
                
// // //                 // Check if the names are in Hebrew
// // //                 const isHebrewA = /[\u0590-\u05FF]/.test(nameA);
// // //                 const isHebrewB = /[\u0590-\u05FF]/.test(nameB);
    
// // //                 if (isHebrewA && isHebrewB) {
// // //                     // Both names are Hebrew
// // //                     return nameA.localeCompare(nameB, 'he');
// // //                 } else if (!isHebrewA && !isHebrewB) {
// // //                     // Both names are not Hebrew
// // //                     return nameA.localeCompare(nameB, 'en');
// // //                 } else {
// // //                     // One name is Hebrew and the other is not
// // //                     return isHebrewA ? 1 : -1;
// // //                 }
// // //             });
    
// // //             setContacts(sortedData);
// // //             setFilteredContacts(sortedData);
// // //         }
// // //     };

// // //     const toggleContactSelection = (contactId) => {
// // //         if (tempSelectedContacts.includes(contactId)) {
// // //             setTempSelectedContacts(tempSelectedContacts.filter(id => id !== contactId));
// // //         } else {
// // //             setTempSelectedContacts([...tempSelectedContacts, contactId]);
// // //         }
// // //     };

// // //     const handleSearch = (text) => {
// // //         setSearchQuery(text);
// // //         if (text) {
// // //             const filtered = contacts.filter(contact => {
// // //                 const contactName = getContactName(contact);
// // //                 return contactName.toLowerCase().includes(text.toLowerCase());
// // //             });
// // //             setFilteredContacts(filtered);
// // //         } else {
// // //             setFilteredContacts(contacts);
// // //         }
// // //     };

// // //     const handleConfirm = async () => {
// // //         if (!currentGroup) return;

// // //         const normalizePhoneNumber = (phone) => {
// // //             return phone.replace(/[-\s]/g, '').replace(/^(\+972|0)/, '+972');
// // //         };

// // //         const selectedContactDetails = tempSelectedContacts.map(contactId => {
// // //             const contact = contacts.find(c => c.id === contactId);
// // //             const contactPhone = contact.phoneNumbers[0].number;
// // //             return { id: contactId, phone: normalizePhoneNumber(contactPhone) };
// // //         });

// // //         const usersSnapshot = await getDocs(collection(db, 'users'));
// // //         const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// // //         const matchedUids = [];
// // //         const unmatchedContacts = [];

// // //         selectedContactDetails.forEach(contact => {
// // //             const matchedUser = users.find(user => {
// // //                 const userPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
// // //                 return userPhone === contact.phone;
// // //             });
// // //             if (matchedUser) {
// // //                 matchedUids.push(matchedUser.id);
// // //             } else {
// // //                 unmatchedContacts.push(contact.id);
// // //             }
// // //         });

// // //         if (matchedUids.length > 0) {
// // //             const groupDocRef = doc(db, 'groups', currentGroup.id);
// // //             await updateDoc(groupDocRef, { participants: arrayUnion(...matchedUids) });

// // //             const updateParticipantsPromises = matchedUids.map(async (participantUid) => {
// // //                 const participantDocRef = doc(db, 'users', participantUid);
// // //                 await updateDoc(participantDocRef, {
// // //                     groups: arrayUnion(currentGroup.id)
// // //                 });
// // //             });
// // //             await Promise.all(updateParticipantsPromises);

// // //             setGroups(groups.map(group => {
// // //                 if (group.id === currentGroup.id) {
// // //                     return { ...group, participants: [...group.participants, ...matchedUids] };
// // //                 }
// // //                 return group;
// // //             }));

// // //             Alert.alert('Success', 'Participants added successfully');
// // //         } else {
// // //             Alert.alert('No Matches', 'No contacts matched existing users.');
// // //         }

// // //         setSelectedContacts([]);
// // //         setModalVisible(false);
// // //         setCurrentGroup(null);
// // //     };

// // //     const handleCancel = () => {
// // //         setModalVisible(false);
// // //     };

// // //     const clearSearch = () => {
// // //         setSearchQuery('');
// // //         setFilteredContacts(contacts);
// // //     };

// // //     const getContactName = (contact) => {
// // //         if (contact.name) return contact.name;
// // //         if (contact.firstName && contact.middleName && contact.lastName) return `${contact.firstName} ${contact.middleName} ${contact.lastName}`;
// // //         if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`;
// // //         if (contact.firstName) return contact.firstName;
// // //         if (contact.lastName) return contact.lastName;
// // //         return 'No Name';
// // //     };

// // //     const GroupItem = ({ item }) => {
// // //         return (
// // //             <View>
// // //                 <View style={styles.tableRow}>
// // //                     <Text style={styles.groupName}>{item.groupName}</Text>
// // //                     <View style={styles.icons}>
// // //                         <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
// // //                             <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
// // //                         </TouchableOpacity>
// // //                         <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
// // //                             <Icon name="plus" size={25} color="grey" />
// // //                         </TouchableOpacity>
// // //                         <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
// // //                             <Icon name="trash" size={25} color="red" />
// // //                         </TouchableOpacity>
// // //                     </View>
// // //                 </View>
// // //                 {expandedGroup === item.id && (
// // //                     <View style={styles.participantsList}>
// // //                         {item.participantsDetails?.map((participant, idx) => (
// // //                             <View
// // //                                 key={participant.id}
// // //                                 style={[
// // //                                     styles.participantRow,
// // //                                     idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
// // //                                 ]}
// // //                             >
// // //                                 <Text style={styles.numberCell}>{idx + 1}.</Text>
// // //                                 <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
// // //                                     {participant.fullName}
// // //                                 </Text>
// // //                                 <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
// // //                             </View>
// // //                         ))}
// // //                     </View>
// // //                 )}
// // //             </View>
// // //         );
// // //     };

// // //     return (
// // //         <View style={styles.container}>
// // //             <Text style={styles.title}>My Groups</Text>
// // //             <FlatList
// // //                 data={groups}
// // //                 renderItem={({ item }) => <GroupItem item={item} />}
// // //                 keyExtractor={(item) => item.id}
// // //             />

// // //             <Modal
// // //                 visible={modalVisible}
// // //                 animationType="slide"
// // //                 onRequestClose={handleCancel}
// // //                 transparent={true}
// // //             >
// // //                 <View style={styles.modalOverlay}>
// // //                     <View style={styles.modalContainer}>
// // //                         <View style={styles.searchContainer}>
// // //                             <Icon name="search" size={20} color="grey" style={styles.searchIcon} />
// // //                             <TextInput 
// // //                                 style={[styles.searchBar, { textAlign: searchQuery && /[\u0590-\u05FF]/.test(searchQuery[0]) ? 'right' : 'left' }]}
// // //                                 placeholder="Search contacts"
// // //                                 placeholderTextColor="grey"
// // //                                 value={searchQuery}
// // //                                 onChangeText={handleSearch}
// // //                             />
// // //                             {searchQuery ? (
// // //                                 <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
// // //                                     <Icon name="times-circle" size={20} color="grey" style={styles.clearIcon} />
// // //                                 </TouchableOpacity>
// // //                             ) : null}
// // //                         </View>
// // //                         <FlatList
// // //                             data={filteredContacts}
// // //                             keyExtractor={(item) => item.id}
// // //                             renderItem={({ item }) => {
// // //                                 const contactName = getContactName(item);
// // //                                 const contactPhone = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'No phone number';
// // //                                 const isSelected = tempSelectedContacts.includes(item.id);
// // //                                 return (
// // //                                     <TouchableOpacity 
// // //                                         style={[styles.contactItem, isSelected ? styles.selected : null]} 
// // //                                         onPress={() => toggleContactSelection(item.id)}
// // //                                     >
// // //                                         <Text style={styles.contactName}>
// // //                                             {contactName}
// // //                                         </Text>
// // //                                         <Text style={styles.contactPhone}>
// // //                                             {contactPhone}
// // //                                         </Text>
// // //                                     </TouchableOpacity>
// // //                                 );
// // //                             }}
// // //                         />
// // //                         <View style={styles.modalButtons}>
// // //                             <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
// // //                                 <Text style={styles.buttonText}>Cancel</Text>
// // //                             </TouchableOpacity>
// // //                             <TouchableOpacity style={styles.modalButton} onPress={handleConfirm}>
// // //                                 <Text style={styles.buttonText}>Confirm</Text>
// // //                             </TouchableOpacity>
// // //                         </View>
// // //                     </View>
// // //                 </View>
// // //             </Modal>
// // //         </View>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         padding: 16,
// // //         backgroundColor: '#fff',
// // //     },
// // //     title: {
// // //         fontSize: 24,
// // //         fontWeight: 'bold',
// // //         marginBottom: 16,
// // //         textAlign: 'center',
// // //     },
// // //     tableRow: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'space-between',
// // //         paddingVertical: 10,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#ccc',
// // //         alignItems: 'center',
// // //     },
// // //     tableCell: {
// // //         flex: 2,
// // //         textAlign: 'left',
// // //         marginLeft: 10, // Move the number and name to the right
// // //     },
// // //     groupName: {
// // //         marginLeft: 15, // Add spacing between the number and the name
// // //         fontWeight: 'bold',
// // //         fontSize: 16,
// // //     },
// // //     icons: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         marginRight: 15, // Move the icons to the left
// // //     },
// // //     iconButton: {
// // //         marginHorizontal: 10, // Add spacing between the icons
// // //     },
// // //     participantsList: {
// // //         paddingVertical: 10,
// // //         paddingLeft: 20,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#ccc',
// // //     },
// // //     participantRow: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         paddingVertical: 10,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#ccc',
// // //     },
// // //     numberCell: {
// // //         width: 20, // Adjust the width as needed
// // //         textAlign: 'right',
// // //     },
// // //     participantName: {
// // //         fontWeight: 'bold',
// // //         fontSize: 16,
// // //         marginLeft: 10, // Adjust the margin as needed
// // //     },
// // //     participant: {
// // //         fontSize: 16,
// // //         paddingVertical: 2,
// // //     },
// // //     modalOverlay: {
// // //         flex: 1,
// // //         justifyContent: 'center',
// // //         backgroundColor: 'rgba(0, 0, 0, 0.5)',
// // //     },
// // //     modalContainer: {
// // //         backgroundColor: '#fff',
// // //         marginHorizontal: 20,
// // //         borderRadius: 10,
// // //         padding: 20,
// // //         maxHeight: '80%',
// // //     },
// // //     searchContainer: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         marginBottom: 20,
// // //         position: 'relative',
// // //     },
// // //     searchIcon: {
// // //         position: 'absolute',
// // //         left: 10,
// // //         zIndex: 1,
// // //     },
// // //     searchBar: {
// // //         flex: 1,
// // //         height: 40,
// // //         borderColor: '#ccc',
// // //         borderWidth: 1,
// // //         borderRadius: 5,
// // //         paddingLeft: 40, // to make room for the search icon
// // //         paddingRight: 40, // to make room for the clear icon
// // //     },
// // //     clearButton: {
// // //         position: 'absolute',
// // //         right: 10,
// // //         zIndex: 1,
// // //     },
// // //     clearIcon: {
// // //         marginHorizontal: 5,
// // //     },
// // //     contactItem: {
// // //         padding: 10,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#ccc',
// // //     },
// // //     contactName: {
// // //         fontSize: 16, // Adjust the size as needed
// // //         fontWeight: 'bold',
// // //     },
// // //     selected: {
// // //         backgroundColor: '#d3d3d3',
// // //     },
// // //     contactPhone: {
// // //         color: 'grey',
// // //     },
// // //     modalButtons: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'space-between',
// // //         paddingTop: 10,
// // //     },
// // //     modalButton: {
// // //         flex: 1,
// // //         marginHorizontal: 5,
// // //         padding: 10,
// // //         backgroundColor: '#007bff',
// // //         borderRadius: 5,
// // //         alignItems: 'center',
// // //     },
// // //     buttonText: {
// // //         color: '#fff',
// // //         fontSize: 16,
// // //     },
// // // });

// // // export default GroupList;

// // // // import React, { useEffect, useState } from 'react';
// // // // import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
// // // // import { db, auth, storage } from '../../../firebaseConfig';
// // // // import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, deleteDoc, getDoc } from 'firebase/firestore';
// // // // import { ref, deleteObject } from 'firebase/storage';
// // // // import Icon from 'react-native-vector-icons/FontAwesome';

// // // // const GroupList = () => {
// // // //     const [groups, setGroups] = useState([]);
// // // //     const [expandedGroup, setExpandedGroup] = useState(null);
// // // //     const user = auth.currentUser;

// // // //     useEffect(() => {
// // // //         const fetchGroups = async () => {
// // // //             const q = query(collection(db, 'groups'), where('participants', 'array-contains', user.uid));
// // // //             const querySnapshot = await getDocs(q);
// // // //             const groupsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
// // // //                 const groupData = { id: doc.id, ...doc.data() };
// // // //                 const participants = await Promise.all(groupData.participants.map(async (participantId) => {
// // // //                     if (participantId === user.uid) {
// // // //                         return { fullName: 'Me', phoneNumber: user.phoneNumber, id: participantId };
// // // //                     }
// // // //                     const details = await getUserDetails(participantId);
// // // //                     return { ...details, id: participantId };
// // // //                 }));
// // // //                 // Move the current user to the first position
// // // //                 const currentUserIndex = participants.findIndex(p => p.id === user.uid);
// // // //                 if (currentUserIndex > -1) {
// // // //                     const currentUser = participants.splice(currentUserIndex, 1)[0];
// // // //                     participants.unshift(currentUser);
// // // //                 }
// // // //                 groupData.participantsDetails = participants;
// // // //                 return groupData;
// // // //             }));
// // // //             setGroups(groupsList);
// // // //         };

// // // //         fetchGroups();
// // // //     }, []);

// // // //     const toggleGroup = (groupId) => {
// // // //         setExpandedGroup(expandedGroup === groupId ? null : groupId);
// // // //     };

// // // //     const handleDeleteGroup = async (group) => {
// // // //         Alert.alert(
// // // //             'Confirm Delete',
// // // //             'Are you sure you want to exit and delete the group?',
// // // //             [
// // // //                 { text: 'Cancel', style: 'cancel' },
// // // //                 {
// // // //                     text: 'Yes',
// // // //                     onPress: async () => {
// // // //                         try {
// // // //                             const userDocRef = doc(db, 'users', user.uid);
// // // //                             await updateDoc(userDocRef, {
// // // //                                 groups: arrayRemove(group.id)
// // // //                             });

// // // //                             if (group.participants.length === 1) {
// // // //                                 // Delete group and associated data
// // // //                                 await deleteDoc(doc(db, 'groups', group.id));
// // // //                                 const storageRef = ref(storage, `groupPic/${group.id}`);
// // // //                                 await deleteObject(storageRef);
// // // //                             } else {
// // // //                                 // Remove user from group participants
// // // //                                 const groupDocRef = doc(db, 'groups', group.id);
// // // //                                 await updateDoc(groupDocRef, {
// // // //                                     participants: arrayRemove(user.uid)
// // // //                                 });
// // // //                             }

// // // //                             setGroups(groups.filter(g => g.id !== group.id));
// // // //                             Alert.alert('Success', 'Group deleted successfully');
// // // //                         } catch (error) {
// // // //                             console.log('Error deleting group:', error);
// // // //                             Alert.alert('Error', 'Failed to delete group', error);
// // // //                         }
// // // //                     },
// // // //                 },
// // // //             ]
// // // //         );
// // // //     };

// // // //     const getUserDetails = async (userId) => {
// // // //         try {
// // // //             const userDoc = await getDoc(doc(db, 'users', userId));
// // // //             if (userDoc.exists()) {
// // // //                 const userData = userDoc.data();
// // // //                 const fullName = `${userData.firstName} ${userData.lastName}`;
// // // //                 return {
// // // //                     fullName: fullName,
// // // //                     phoneNumber: userData.phoneNumber,
// // // //                 };
// // // //             } else {
// // // //                 console.log('No such document!');
// // // //             }
// // // //         } catch (error) {
// // // //             console.log('Error getting document:', error);
// // // //         }
// // // //         return { fullName: 'Unknown', phoneNumber: 'Unknown' }; // Fallback in case of an error
// // // //     };

// // // //     const GroupItem = ({ item }) => {
// // // //         return (
// // // //             <View>
// // // //                 <View style={styles.tableRow}>
// // // //                     <Text style={styles.groupName}>{item.groupName}</Text>
// // // //                     <View style={styles.icons}>
// // // //                         <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
// // // //                             <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
// // // //                         </TouchableOpacity>
// // // //                         <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
// // // //                             <Icon name="plus" size={25} color="grey" />
// // // //                         </TouchableOpacity>
                        
// // // //                         <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
// // // //                             <Icon name="trash" size={25} color="red" />
// // // //                         </TouchableOpacity>
// // // //                     </View>
// // // //                 </View>
// // // //                 {expandedGroup === item.id && (
// // // //                     <View style={styles.participantsList}>
// // // //                         {item.participantsDetails?.map((participant, idx) => (
// // // //                             <View
// // // //                                 key={participant.id}
// // // //                                 style={[
// // // //                                     styles.participantRow,
// // // //                                     idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
// // // //                                 ]}
// // // //                             >
// // // //                                 <Text style={styles.numberCell}>{idx + 1}.</Text>
// // // //                                 <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
// // // //                                     {participant.fullName}
// // // //                                 </Text>
// // // //                                 <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
// // // //                             </View>
// // // //                         ))}
// // // //                     </View>
// // // //                 )}
// // // //             </View>
// // // //         );
// // // //     };

// // // //     return (
// // // //         <View style={styles.container}>
// // // //             <Text style={styles.title}>My Groups</Text>
// // // //             <FlatList
// // // //                 data={groups}
// // // //                 renderItem={({ item }) => <GroupItem item={item} />}
// // // //                 keyExtractor={(item) => item.id}
// // // //             />
// // // //         </View>
// // // //     );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //     container: {
// // // //         flex: 1,
// // // //         padding: 16,
// // // //         backgroundColor: '#fff',
// // // //     },
// // // //     title: {
// // // //         fontSize: 24,
// // // //         fontWeight: 'bold',
// // // //         marginBottom: 16,
// // // //         textAlign: 'center',
// // // //     },
// // // //     tableRow: {
// // // //         flexDirection: 'row',
// // // //         justifyContent: 'space-between',
// // // //         paddingVertical: 10,
// // // //         borderBottomWidth: 1,
// // // //         borderBottomColor: '#ccc',
// // // //         alignItems: 'center',
// // // //     },
// // // //     tableCell: {
// // // //         flex: 2,
// // // //         textAlign: 'left',
// // // //         marginLeft: 10, // Move the number and name to the right
// // // //     },
// // // //     groupName: {
// // // //         marginLeft: 15, // Add spacing between the number and the name
// // // //         fontWeight: 'bold',
// // // //         fontSize: 16,
// // // //     },
// // // //     icons: {
// // // //         flexDirection: 'row',
// // // //         alignItems: 'center',
// // // //         marginRight: 15, // Move the icons to the left
// // // //     },
// // // //     iconButton: {
// // // //         marginHorizontal: 10, // Add spacing between the icons
// // // //     },
// // // //     participantsList: {
// // // //         paddingVertical: 10,
// // // //         paddingLeft: 20,
// // // //         borderBottomWidth: 1,
// // // //         borderBottomColor: '#ccc',
// // // //     },
// // // //     participantRow: {
// // // //         flexDirection: 'row',
// // // //         alignItems: 'center',
// // // //         paddingVertical: 10,
// // // //         borderBottomWidth: 1,
// // // //         borderBottomColor: '#ccc',
// // // //     },
// // // //     numberCell: {
// // // //         width: 20, // Adjust the width as needed
// // // //         textAlign: 'right',
// // // //     },
// // // //     participantName: {
// // // //         fontWeight: 'bold',
// // // //         fontSize: 16,
// // // //         marginLeft: 10, // Adjust the margin as needed
// // // //     },
// // // //     participant: {
// // // //         fontSize: 16,
// // // //         paddingVertical: 2,
// // // //     },
// // // // });

// // // // export default GroupList;
