import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import { auth, db, storage } from '../../../firebaseConfig';
import { addDoc, collection, doc, updateDoc, arrayUnion  } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CommonActions } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import UploadPhoto from '../../components/UploadImage/UploadImage';
import communLogo from '../../../assets/images/communLogo.jpg';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getDocs } from 'firebase/firestore';

const NewGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [tempImageUri, setTempImageUri] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [tempSelectedContacts, setTempSelectedContacts] = useState([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const user = auth.currentUser;
    const uId = user.uid;

    const navigation = useNavigation();


    const handleSave = async () => {
        if (!groupName) {
            Alert.alert('Error', 'Group Name is required');
            return;
        }
    
        const groupData = {
            groupName: groupName,
            desc: groupDescription,
            groupAdmins: [uId],
            participants: [uId], // Initialize with current user
            groupImage: '', // Placeholder for group image ID
        };
    
        try {
            const groupRef = await addDoc(collection(db, 'groups'), groupData);
    
            // Upload the image after the group is created
            if (tempImageUri) {
                await uploadGroupImage(tempImageUri, groupRef.id);
            }
    
            // Update the group image field with the group ID
            await updateDoc(groupRef, { groupImage: groupRef.id });
    
            // Fetch all users from the database
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
            const normalizePhoneNumber = (phone) => {
                return phone.replace(/[-\s]/g, '').replace(/^(\+972|0)/, '+972');
            };
    
            const selectedContactDetails = selectedContacts.map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                const contactPhone = contact.phoneNumbers[0].number;
                return { id: contactId, phone: normalizePhoneNumber(contactPhone) };
            });
    
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
    
            // Update the participants field with matched UIDs
            await updateDoc(groupRef, { participants: arrayUnion(...matchedUids) });
    
            // Log unmatched contacts
            if (unmatchedContacts.length > 0) {
                unmatchedContacts.forEach(contactId => {
                    const contact = contacts.find(c => c.id === contactId);
                    console.log('Unmatched Contact:', getContactName(contact));
                });
            }
    
            // Update user's groups field
            const userDocRef = doc(db, 'users', uId);
            await updateDoc(userDocRef, {
                groups: arrayUnion(groupRef.id)
            });
    
            // Update all other matched users' groups field
            const updateParticipantsPromises = matchedUids.map(async (participantUid) => {
                const participantDocRef = doc(db, 'users', participantUid);
                await updateDoc(participantDocRef, {
                    groups: arrayUnion(groupRef.id)
                });
            });
            await Promise.all(updateParticipantsPromises);
    
            Alert.alert('Success', 'Group created successfully');
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }],
            }));
        } catch (error) {
            Alert.alert('Error', 'Failed to create group');
        }
    };
    

    const uploadGroupImage = async (uri, groupId) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `groupPic/${groupId}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);
    
            await uploadTask;
    
            // Update group document with the image ID
            await updateDoc(doc(db, 'groups', groupId), { groupImage: groupId });
        } catch (error) {
            console.log('Error uploading group image:', error);
        }
    };
    

    const cancelPress = () => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: 'homeScreen' }],
        }));
    };

    const handleImageUpload = (imageUri) => {
        setTempImageUri(imageUri);
    };

    const requestContactsPermission = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            setPermissionGranted(true);
            loadContacts();
            setTempSelectedContacts(selectedContacts);
            setModalVisible(true);
        } else {
            Alert.alert('Permission Denied', 'Cannot access contacts');
        }
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
    

    const handleConfirm = () => {
        setSelectedContacts(tempSelectedContacts);
        setModalVisible(false);
    };

    const handleCancel = () => {
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
    

    const removeContact = (contactId) => {
        setSelectedContacts(selectedContacts.filter(id => id !== contactId));
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <UploadPhoto 
                    storagePath="groupPic" 
                    imageName={groupName} 
                    defaultImage={communLogo} 
                    onImageUpload={handleImageUpload} 
                />
                <CustomInput 
                    value={groupName}
                    setValue={setGroupName}
                    placeholder="Enter group name"
                />
                <CustomInput 
                    value={groupDescription}
                    setValue={setGroupDescription}
                    placeholder="Enter group description" 
                />
                <CustomButton 
                    text="Select Contacts"
                    title="Select Contacts" 
                    onPress={requestContactsPermission} 
                />
                {selectedContacts.length > 0 && (
                    <View style={styles.contactsTable}>
                        <Text style={styles.tableHeader}>Selected Contacts:</Text>
                        {selectedContacts.map((contactId, index) => {
                            const contact = contacts.find(c => c.id === contactId);
                            const contactName = getContactName(contact);
                            const contactPhone = contact.phoneNumbers && contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].number : 'No phone number';
                            return (
                                <View key={contactId} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{index + 1}</Text>
                                    <Text style={styles.tableCell}>{contactName}</Text>
                                    <Text style={styles.tableCell}>{contactPhone}</Text>
                                    <TouchableOpacity onPress={() => removeContact(contactId)}>
                                        <Icon name="times-circle" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}
                <CustomButton 
                    text="Save"
                    title="Save" 
                    onPress={handleSave} 
                />
                <CustomButton 
                    text="Cancel"
                    title="Cancel" 
                    onPress={cancelPress}
                    type = "PRIMARY"
                    
                />
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
        backgroundColor: '#fff',
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
    contactsTable: {
        width: '90%',
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    tableCell: {
        flex: 1,
        textAlign: 'left',
    },
    cancelButton: {
        backgroundColor: 'red',
    },
    
});

export default NewGroup;



