import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { auth, db } from '../../../firebaseConfig';
import { addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const NewRideScreen = () => {
    const navigation = useNavigation();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [dName, setDName] = useState('');
    const [dNumber, setDNumber] = useState('');
    const [places, setPlaces] = useState('');
    const [comment, setComment] = useState('');
    const [cost, setCost] = useState(''); 
    const [requiredFields, setRequiredFields] = useState({
        source: false,
        destination: false,
        dName: false,
        dNumber: false,
    });

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const userDoc = doc(db, "users", user.uid);
            getDoc(userDoc).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const fullName = `${userData.firstName} ${userData.lastName}`;
                    setDName(fullName);
                    setDNumber(userData.phone);
                }
            });
        }
    }, []);

    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'set') {
            const currentDate = selectedDate || date;
            setDate(currentDate);
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        if (event.type === 'set') {
            const currentTime = selectedTime || time;
            setTime(currentTime);
        }
    };

    const checkRequiredFields = () => {
        return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
    };

    const handleSave = async () => {
        if (checkRequiredFields()) {
            const rideData = {
                comment,
                cost: parseInt(places) || 0,
                date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),
                source,
                dest: destination,
                driver_name: dName,
                dPhone: dNumber,
                places: parseInt(places) || 0,
                joins: [],
            };
            console.log(rideData);
            try {
                // const newRideDoc = doc(db, 'rides', firebase.firestore().collection('rides').doc().id);
                // await setDoc(newRideDoc, rideData);
                await addDoc(collection(db, 'rides'), rideData);                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'homeScreen' }],
                });
            } catch (error) {
                console.error('Error adding document: ', error);
            }
        } else {
            setRequiredFields({
                source: source === '',
                destination: destination === '',
                dName: dName === '',
                dNumber: dNumber === '',
            });
        }
    };

    const handleClear = () => {
        setSource('');
        setDestination('');
        setDate(new Date());
        setTime(new Date());
        setPlaces('');
        setComment('');
        setCost('');
        setRequiredFields({
            source: false,
            destination: false,
            dName: false,
            dNumber: false,
        });
    };

    const handleReturn = () => {
        handleClear();
        navigation.reset({
            index: 0,
            routes: [{ name: 'homeScreen' }],
        });
    };

    const getGooglePlacesSuggestions = async (input) => {
        const apiKey = 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk';
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const json = await response.json();
            return json.predictions.map(prediction => prediction.description);
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const handleSourceChange = async (text) => {
        setSource(text);
        const suggestions = await getGooglePlacesSuggestions(text);
        console.log(suggestions);
    };

    const handleDestinationChange = async (text) => {
        setDestination(text);
        const suggestions = await getGooglePlacesSuggestions(text);
        console.log(suggestions);
    };

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.scrollViewContainer}>
            <Text style={styles.headerText}>New Ride</Text>
            <View style = {styles.googleFind}>
                    <GooglePlacesAutocomplete
                        placeholder='Source Address'
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(data, details);
                            setSource(data.description);
                        }}
                        query={{
                            key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                            lan: 'en',
                        }}
                    />
                </View>
                <View style = {styles.googleFind}>
                    <GooglePlacesAutocomplete
                        placeholder='Destination Address'
                        style={styles.googleFind}
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            console.log(data, details);
                            setDestination(data.description);
                        }}
                        query={{
                            key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                            lan: 'en',
                        }}
                    />
                </View>
                <View style = {styles.container}>
                <View style={styles.dateTimeRow}>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        style={styles.dateTimePicker}
                    />
                    <View style={styles.space} />
                    <DateTimePicker
                        value={time}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                        style={styles.dateTimePicker}
                    />
                </View>
                <CustomInput
                    setValue={setDName}
                    placeholder= {dName}
                    style={requiredFields.dName && styles.required}
                />
                <CustomInput
                    setValue={setDNumber}
                    placeholder={dNumber}
                    style={requiredFields.dNumber && styles.required}
                    keyboardType="phone-pad"
                />
                <CustomInput
                    value={places}
                    setValue={setPlaces}
                    placeholder="Vacant places"
                    keyboardType="numeric"
                />
                <CustomInput
                    value={cost}
                    setValue={setCost}
                    placeholder="cost"
                    keyboardType="numeric"
                />
                <CustomInput
                    value={comment}
                    setValue={setComment}
                    placeholder="Comments"
                />
                <CustomButton
                    onPress={handleSave}
                    text="Save"
                />
                <CustomButton
                    onPress={handleClear}
                    text="Clear"
                    type="SECONDARY"
                />
                <CustomButton
                    onPress={handleReturn}
                    text="Return"
                    type="SECONDARY"
                />
                </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
        paddingBottom: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        
    },
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
    headerText: {
        textAlign: 'center',
        fontSize: 35,
        paddingTop: 20,
        fontWeight: 'bold',
    },
    googleFind: {
        width: 'center', 
        margin: 10, 
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        // paddingHorizontal: 10,
        // marginVertical: 7
    },
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '65%',
        margin: 7,
    },
    dateTimePicker: {
        flex: 1,
    },
    space: {
        width: 10,
    },
    required: {
        borderColor: 'red',
        borderWidth: 1,
    },
});

export default NewRideScreen;
