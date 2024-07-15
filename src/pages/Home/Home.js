import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
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

    const fetchRides = async () => {
        try {
            setLoading(true);

            const userId = auth.currentUser.uid;
            const userDoc = await getDoc(doc(db, 'users', userId));
            const groups = userDoc.data().groups || [];
            const fetchedRides = new Set();
            let ridesList = [];

            const groupDocs = await Promise.all(groups.map(groupId => getDoc(doc(db, 'groups', groupId))));
            const allParticipants = groupDocs.flatMap(groupDoc => groupDoc.data().participants || []);
            const uniqueParticipants = [...new Set(allParticipants)].filter(participantId => participantId !== userId);

            const participantDocs = await Promise.all(uniqueParticipants.map(participantId => getDoc(doc(db, 'users', participantId))));
            const participantMap = new Map();
            participantDocs.forEach(doc => {
                const data = doc.data();
                participantMap.set(doc.id, {
                    email: data.email,
                    fullName: `${data.firstName} ${data.lastName}`
                });
            });

            for (const participantId of uniqueParticipants) {
                const ridesQuery = query(
                    collection(db, 'rides'),
                    where('userId', '==', participantId)
                );
                const ridesQuerySnapshot = await getDocs(ridesQuery);

                const rideDataPromises = ridesQuerySnapshot.docs.map(async (rideDoc) => {
                    if (!fetchedRides.has(rideDoc.id)) {
                        let rideData = rideDoc.data();
                        const participant = participantMap.get(rideData.userId);
                        const profilePicUrl = await getDownloadURL(ref(storage, `profile/${participant.email}`));
                        const rideDateTime = rideData.date_time.toDate();
                        if (rideDateTime > new Date()) {
                            rideData = {
                                ...rideData,
                                profilePicUrl,
                                fullName: participant.fullName,
                                fromLocation: rideData.source,
                                toLocation: rideData.dest,
                                date: rideDateTime.toLocaleDateString(),
                                time: rideDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                dateTime: rideDateTime, // Store Date object for sorting purposes
                                cost: rideData.cost,
                                vacantPlaces: rideData.places,
                                comments: rideData.comment,
                                userEmail: participant.email
                            };
                            fetchedRides.add(rideDoc.id);
                            return rideData;
                        }
                    }
                });

                ridesList = ridesList.concat(await Promise.all(rideDataPromises));
            }

            ridesList = ridesList.filter(ride => ride !== undefined);

            ridesList.sort((a, b) => {
                const dateComparison = a.dateTime - b.dateTime;
                return dateComparison !== 0 ? dateComparison : a.dateTime - b.dateTime;
            });

            setRides(ridesList);
            setFilteredRides(ridesList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching rides: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const queryLowerCase = searchQuery.toLowerCase();
            const filtered = rides.filter(ride =>
                ride.fromLocation.toLowerCase().includes(queryLowerCase) ||
                ride.toLocation.toLowerCase().includes(queryLowerCase)
            );
            setFilteredRides(filtered);
        } else {
            setFilteredRides(rides);
        }
    }, [searchQuery, rides]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <ScrollView>
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
        {filteredRides.map((ride, index) => (
            <CustomRideItem key={index} {...ride} />
        ))}
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </KeyboardAvoidingView>
</ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 20,
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
        paddingLeft: 40, // to make room for the search icon
        paddingRight: 40, // to make room for the clear icon
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
});

export default HomeScreen;
