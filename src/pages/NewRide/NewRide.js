import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../../../firebaseConfig';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewRide = () => {
    const [source, setSource] = useState('');
    const [dest, setDest] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [dateText, setDateText] = useState('Select Date');
    const [timeText, setTimeText] = useState('Select Time');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [driverName, setDriverName] = useState('');
    const [dPhone, setDPhone] = useState('');
    const [vacantPlaces, setVacantPlaces] = useState('');
    const [rideCost, setRideCost] = useState('');
    const [driverComment, setDriverComment] = useState('');
    const user = auth.currentUser;

    const navigation = useNavigation();

    useEffect(() => {
        if (user) {
            const userDoc = doc(db, "users", user.uid);
            getDoc(userDoc).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const fullName = userData.firstName + " " + userData.lastName;
                    const phoneNumber = userData.phone;
                    setDriverName(fullName);
                    setDPhone(userData.phone);
                }
            });
        }
    }, [user]);

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
            setDateText(selectedDate.toDateString());
        }
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
            const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setTimeText(formattedTime);
        }
    };

    const handleSave = () => {
        console.log("Handle Save Triggered");
        console.log("Source:", source);
        console.log("Destination:", dest);
        console.log("Driver Name:", driverName);
        console.log("Driver Phone:", dPhone);
        console.log("Places:", vacantPlaces);
        console.log("Cost:", rideCost);
        console.log("Comment:", driverComment);

        if (!source || !dest || !driverName || !dPhone) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const newRide = {
            source,
            dest,
            date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),
            driver_name: driverName,
            dPhone,
            places: vacantPlaces ? parseInt(vacantPlaces, 10) : 0,
            cost: rideCost ? parseFloat(rideCost) : 0,
            comment: driverComment || '',
            userId: user.uid,
        };

        addDoc(collection(db, 'rides'), newRide)
            .then(() => {
                Alert.alert('Success', 'Ride added successfully!');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'homeScreen' }],
                });
            })
            .catch((error) => {
                Alert.alert('Error', error.message);
            });
    };

    const returnPress = () => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'homeScreen' }
            ],
        }));
    };

    return (
        <KeyboardAvoidingView>
            <Text style={styles.title}>New Ride</Text>

            <KeyboardAvoidingView style={styles.addressRow}>
                <GooglePlacesAutocomplete
                    placeholder='Enter source address'
                    fetchDetails={true}
                    debounce={300}
                    onPress={(data, details = null) => {
                        setSource(data.description);
                    }}
                    styles={{
                        container: {
                            flex: 0,
                            paddingHorizontal: 10,
                        },
                        textInput: {
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            marginBottom: 12,
                            paddingLeft: 8,
                        }
                    }}
                    query={{
                        key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                        language: 'en',
                    }}
                />

                <GooglePlacesAutocomplete
                    placeholder='Enter destination address'
                    fetchDetails={true}
                    debounce={300}
                    onPress={(data, details = null) => {
                        setDest(data.description);
                    }}
                    styles={{
                        container: {
                            flex: 0,
                            paddingHorizontal: 10,
                        },
                        textInput: {
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 1,
                            marginBottom: 10,
                            paddingLeft: 8,
                        }
                    }}
                    query={{
                        key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                        language: 'en',
                    }}
                />
            </KeyboardAvoidingView>

            <KeyboardAvoidingView style={styles.timeRow}>
                {Platform.OS === 'ios' ? (
                    <>
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                        <DateTimePicker
                            value={time}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                        />
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.button}>
                            <Text style={styles.buttonText}>{dateText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.button}>
                            <Text style={styles.buttonText}>{timeText}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={onChangeTime}
                            />
                        )}
                    </>
                )}
            </KeyboardAvoidingView>

            <KeyboardAvoidingView style={{ alignItems: 'center'  }}>
                <CustomInput
                    setValue={setDriverName}
                    placeholder={driverName ? driverName : 'Driver Name'}
                />
                <CustomInput
                    setValue={setDPhone}
                    placeholder={dPhone ? dPhone : 'Phone Number'}
                />
                <CustomInput
                    value={vacantPlaces}
                    setValue={setVacantPlaces}
                    placeholder="Vacant Places (Optional)"
                    keyboardType="numeric"
                />
                <CustomInput
                    value={rideCost}
                    setValue={setRideCost}
                    placeholder="Cost (Optional)"
                    keyboardType="numeric"
                />
                <CustomInput
                    value={driverComment}
                    setValue={setDriverComment}
                    placeholder="Comments (Optional)"
                />

                <CustomButton
                    title="Save"
                    onPress={handleSave}
                    text="Save"
                />

                <CustomButton
                    title="Return"
                    onPress={returnPress}
                    text="Cancel"
                    type="SECONDARY"
                />
            </KeyboardAvoidingView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        margin: 10,
        textAlign: 'center',
    },
    textInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 8,
    },
    button: {
        flex: 1,
        borderRadius: 7,
        marginHorizontal: 5,
        padding: 10,
        backgroundColor: '#3B71F3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    buttonText: {
        fontWeight: 'bold',
        color: 'white',
    },
    itemContainer: {
        
    }
});

export default NewRide;
