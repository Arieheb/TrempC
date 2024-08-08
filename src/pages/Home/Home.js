import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomRideItem from '../../components/RideItem/RideItem';
import { db, auth, storage } from '../../../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ref, getDownloadURL } from "firebase/storage";
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Fetches rides when the component mounts
    useEffect(() => {
        fetchRides();
    }, []);

    // Filters rides based on the search query
    useEffect(() => {
        if (searchQuery) {
            const queryLowerCase = searchQuery.toLowerCase();
            const filtered = rides.filter(ride =>
                ride.fromLocation.toLowerCase().includes(queryLowerCase) ||
                ride.toLocation.toLowerCase().includes(queryLowerCase)
            );
            setFilteredRides(filtered);

            if (filtered.length === 0) {
                setErrorMessage('No existing rides match your search.');
            } else {
                setErrorMessage('');
            }
        } else {
            setFilteredRides(rides);
            setErrorMessage('');
        }
    }, [searchQuery, rides]);

    /**
     * Fetches rides for the current user based on their group memberships.
     */
    const fetchRides = async () => {
        try {
            setLoading(true);
            setErrorMessage('');

            const userId = auth.currentUser.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            const groups = userDoc.data().groups || [];

            if (!userDoc.data().hasOwnProperty('groups')) {
                setErrorMessage('Create a group or join an existing group to view and share rides.');
                setLoading(false);
                return;
            }

            const fetchedRides = new Set();
            let ridesList = [];

            const groupDocs = await Promise.all(groups.map(groupId => getDoc(doc(db, 'groups', groupId))));
            const allParticipants = groupDocs.flatMap(groupDoc => {
                return groupDoc.data().participants || [];
            });

            const uniqueParticipants = [...new Set(allParticipants)].filter(participantId => participantId !== userId);

            const participantDocs = await Promise.all(uniqueParticipants.map(participantId => getDoc(doc(db, 'users', participantId))));
            const participantMap = new Map();
            participantDocs.forEach(doc => {
                const data = doc.data();
                participantMap.set(doc.id, {
                    email: data.email,
                    fullName: `${data.firstName} ${data.lastName}`,
                    phoneNumber: data.phoneNumber 
                });
            });

            for (const groupDoc of groupDocs) {
                const groupData = groupDoc.data();
                const groupImage = groupData.groupImage;
                const groupImageUrl = await getDownloadURL(ref(storage, `groupPic/${groupImage}`));

                const participantIds = groupData.participants || [];
                
                for (const participantId of participantIds) {
                    if (participantId !== userId) {
                        const ridesQuery = query(
                            collection(db, 'rides'),
                            where('userId', '==', participantId)
                        );
                        const ridesQuerySnapshot = await getDocs(ridesQuery);

                        const rideDataPromises = ridesQuerySnapshot.docs.map(async (rideDoc) => {
                            if (!fetchedRides.has(rideDoc.id)) {
                                let rideData = rideDoc.data();
                                const participant = participantMap.get(rideData.userId);
                                const profilePicUrl = await getDownloadURL(ref(storage, `profile/${participant.email.toLowerCase()}`));
                                const rideDateTime = rideData.date_time.toDate();
                                if (rideDateTime > new Date()) {
                                    rideData = {
                                        ...rideData,
                                        profilePicUrl,
                                        fullName: participant.fullName,
                                        phoneNumber: rideData.dPhone,
                                        fromLocation: rideData.source,
                                        toLocation: rideData.dest,
                                        date: rideDateTime.toLocaleDateString(),
                                        time: rideDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                        dateTime: rideDateTime,
                                        cost: rideData.cost,
                                        vacantPlaces: rideData.places,
                                        comments: rideData.comment,
                                        userEmail: participant.email,
                                        groupImageUrl // Add the group image URL here
                                    };
                                    fetchedRides.add(rideDoc.id);
                                    return rideData;
                                }
                            }
                        });

                        ridesList = ridesList.concat(await Promise.all(rideDataPromises));
                    }
                }
            }

            ridesList = ridesList.filter(ride => ride !== undefined);

            ridesList.sort((a, b) => {
                const dateComparison = a.dateTime - b.dateTime;
                return dateComparison !== 0 ? dateComparison : a.dateTime - b.dateTime;
            });

            setRides(ridesList);
            setFilteredRides(ridesList);

            if (ridesList.length === 0) {
                setErrorMessage('No rides available in your groups.');
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching rides: ", error);
            setLoading(false);
        }
    };

    /**
     * Handles search input change and filters rides accordingly.
     * 
     * text - The search query.
     */
    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    /**
     * Clears the search query and resets the filtered rides.
     */
    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <ScrollView style={styles.scrollView}>
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={20} color="grey" style={styles.searchIcon} />
                    <TextInput 
                        style={[styles.searchBar, { textAlign: searchQuery && /[\u0590-\u05FF]/.test(searchQuery[0]) ? 'right' : 'left' }]}
                        placeholder="Search rides"
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
                {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                ) : (
                    filteredRides.map((ride, index) => (
                        <CustomRideItem key={index} {...ride} />
                    ))
                )}
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        paddingVertical: 8,
        width: '95%',
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
        right: 5, 
        top: 18, 
        zIndex: 1, 
    },
    clearIcon: {
        marginRight: 10,
    },
    errorText: {
        color: 'grey',
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 20,
        width: '90%',
    },
});

export default HomeScreen;
