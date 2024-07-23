import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { db, auth, storage } from '../../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove, arrayUnion, deleteDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL } from 'firebase/storage';
import { Image } from 'react-native';
import { ref, deleteObject } from 'firebase/storage';
import * as Contacts from 'expo-contacts';
import Icon from 'react-native-vector-icons/FontAwesome';

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState([]);
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
            const adminParticipants = groupData.groupAdmins || [];
    
            // Sort participants: current user first, then admins, then others
            participants.sort((a, b) => {
                if (a.id === user.uid) return -1;
                if (b.id === user.uid) return 1;
                const aIsAdmin = adminParticipants.includes(a.id);
                const bIsAdmin = adminParticipants.includes(b.id);
                if (aIsAdmin && !bIsAdmin) return -1;
                if (!aIsAdmin && bIsAdmin) return 1;
                return 0;
            });
    
            groupData.participantsDetails = participants;
    
            // Fetch group profile picture URL
            if (groupData.groupImage) {
                try {
                    const imageRef = ref(storage, `groupPic/${groupData.groupImage}`);
                    const profilePictureUrl = await getDownloadURL(imageRef);
                    groupData.profilePictureUrl = profilePictureUrl;
                } catch (error) {
                    console.error("Error fetching profile picture URL:", error);
                    groupData.profilePictureUrl = null;
                }
            } else {
                groupData.profilePictureUrl = null;
            }
    
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
        setExpandedGroups(prevState => {
            if (prevState.includes(groupId)) {
                return prevState.filter(id => id !== groupId);
            } else {
                return [...prevState, groupId];
            }
        });
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
            }
        } catch (error) {
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
            const contactsWithPhoneNumbers = data.filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0);
            const sortedData = contactsWithPhoneNumbers.sort((a, b) => {
                const nameA = getContactName(a).toLowerCase();
                const nameB = getContactName(b).toLowerCase();
                const isHebrewA = /[\u0590-\u05FF]/.test(nameA);
                const isHebrewB = /[\u0590-\u05FF]/.test(nameB);
                if (isHebrewA && isHebrewB) {
                    return nameA.localeCompare(nameB, 'he');
                } else if (!isHebrewA && !isHebrewB) {
                    return nameA.localeCompare(nameB, 'en');
                } else {
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

        setModalVisible(false);

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
                setModalVisible(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to add participants');
            setModalVisible(true);
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

    const makeAdmin = async (groupId, userId) => {
        const groupDocRef = doc(db, 'groups', groupId);
        await updateDoc(groupDocRef, {
            groupAdmins: arrayUnion(userId)
        });
        fetchGroups();
    };

    const removeParticipant = async (groupId, userId) => {
        const groupDocRef = doc(db, 'groups', groupId);
        await updateDoc(groupDocRef, {
            participants: arrayRemove(userId),
            groupAdmins: arrayRemove(userId)
        });
        fetchGroups();
    };

    const GroupItem = ({ item }) => {
        const isAdmin = item.groupAdmins && item.groupAdmins.includes(user.uid);
    
        const toggleAdminStatus = async (groupId, userId) => {
            const groupDocRef = doc(db, 'groups', groupId);
            const groupDoc = await getDoc(groupDocRef);
            if (groupDoc.exists()) {
                const groupData = groupDoc.data();
                const isUserAdmin = groupData.groupAdmins.includes(userId);
                if (isUserAdmin) {
                    await updateDoc(groupDocRef, {
                        groupAdmins: arrayRemove(userId)
                    });
                } else {
                    await updateDoc(groupDocRef, {
                        groupAdmins: arrayUnion(userId)
                    });
                }
                fetchGroups();
            }
        };
    
        const confirmRemoveParticipant = (groupId, userId) => {
            Alert.alert(
                'Confirm Remove',
                'Are you sure you want to remove from the group?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Yes',
                        onPress: async () => {
                            await removeParticipant(groupId, userId);
                        }
                    }
                ]
            );
        };
    
        return (
            <View>
                <View style={styles.tableRow}>
                    <View style={styles.profileAndName}>

                    {/* getting the profile picture of the group */}
                     
                        {/* {item.profilePictureUrl ? (
                            <Image source={{ uri: item.profilePictureUrl }} style={styles.profilePicture} />
                        ) : (
                            <View style={styles.profilePicturePlaceholder}>
                                <Icon name="group" size={25} color="#ccc" />
                            </View>
                        )} */}
                        <Text style={styles.groupName}>{item.groupName}</Text>
                    </View>
                    <View style={styles.icons}>
                        <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
                            <Icon name={expandedGroups.includes(item.id) ? 'caret-down' : 'caret-right'} size={25} style={{paddingRight: 15}} />
                        </TouchableOpacity>
                        {isAdmin && (
                            <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
                                <Icon name="plus" size={25} color="grey" style={{paddingRight: 15}} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
                            <Icon name="trash" size={25} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
                {expandedGroups.includes(item.id) && (
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
                                <Text style={[
                                    styles.participantName,
                                    participant.fullName === 'Me' && { fontStyle: 'italic' }
                                ]}>
                                    {participant.fullName}
                                    {item.groupAdmins.includes(participant.id) && (
                                        <Text style={{ fontStyle: 'italic', fontWeight: 'normal' }}> (admin)</Text>
                                    )}
                                </Text>
                                <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
                                {isAdmin && participant.id !== user.uid && (
                                    <View style={styles.actionIcons}>
                                        <TouchableOpacity onPress={() => toggleAdminStatus(item.id, participant.id)} style={styles.iconButton}>
                                            <Icon name={item.groupAdmins.includes(participant.id) ? 'user-times' : 'user-plus'} size={20} color="blue" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => confirmRemoveParticipant(item.id, participant.id)} style={styles.iconButton}>
                                            <Icon name="trash" size={20} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
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
    profileAndName: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 30,
        marginRight: 10,
        marginLeft: 15
    },
    profilePicturePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    tableCell: {
        flex: 2,
        textAlign: 'left',
        marginLeft: 10,
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 16,
        paddingLeft: 10,
    },
    icons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    iconButton: {
        marginHorizontal: 5,
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
        width: 20,
        textAlign: 'right',
    },
    participantName: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    actionIcons: {
        flexDirection: 'row',
        marginLeft: 'auto',
        paddingRight: 10,
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
        paddingLeft: 40,
        paddingRight: 40,
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
        fontSize: 16,
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
