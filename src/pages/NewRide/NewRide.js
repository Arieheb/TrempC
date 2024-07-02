import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../../../firebaseConfig';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import { Timestamp } from 'firebase/firestore';
import { addDoc, collection } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
const NewRide = () => {
const [source, setSource] = useState('');
const [dest, setDest] = useState('');
const [date, setDate] = useState(new Date());
const [time, setTime] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [driverName, setDriverName] = useState('');
const [dPhone, setDPhone] = useState('');
const [places, setPlaces] = useState('');
const [cost, setCost] = useState('');
const [comment, setComment] = useState('');
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
    }, []);


const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
    setDate(selectedDate);
    }
};

const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
    setTime(selectedTime);
    }
};

const handleSave = () => {
    if (!source || !dest || !driverName || !dPhone) {
        console.log ("source", source);
        console.log ("dest", dest);
        console.log ("driverName", driverName);
        console.log ("dPhone", dPhone);
    Alert.alert('Error', 'Please fill in all required fields.');
    return;
    }

    const newRide = {
    source,
    dest,
    date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),      driver_name: driverName,
    dPhone,
    places: places ? parseInt(places, 10) : 0,
    cost: cost ? parseFloat(cost) : 0,
    comment: comment || '',
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

        <View style = {styles.addressRow}>
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
            query = {{
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
                    marginBottom: 12,
                    paddingLeft: 8,
                    
                }
        }}  
        query = {{
            key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
            language: 'en',
        }}
        />
        </View>
        
        <View style = {styles.timeRow}>
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
        </View>


        <View style = {{alignItems: 'center'}}>
        <CustomInput
            label="Driver Name"
            placeholder={driverName}
            onChangeText={setDriverName}
        />
        <CustomInput
            label="Driver Phone"
            placeholder={dPhone}
            onChangeText={setDPhone}
        />
        <CustomInput
            label="Vacant Places"
            placeholder="Vacant Places"
            onChangeText={setPlaces}
            keyboardType="numeric"
        />
        <CustomInput
            label="Cost"
            placeholder="Cost"
            onChangeText={setCost}
            keyboardType="numeric"
        />
        <CustomInput
            label="Comment"
            placeholder="Comments"
            onChangeText={setComment}
        />     
        
        <CustomButton
            title = "Save"
            onPress={handleSave}
            text="Save"
        />
        
        <CustomButton
            title = "Return"
            onPress={returnPress}
            text="Cancel"
            type="SECONDARY"
                />
        </View>
        

        
    </KeyboardAvoidingView>

    
    
        // <KeyboardAvoidingView style={styles.container}>
        // <Text>Source Address</Text>
        // <GooglePlacesAutocomplete
        //     placeholder='Enter source address'
        //     fetchDetails={true}
        //     onPress={(data, details = null) => {
        //     setSource(data.description);
        //     }}
        //     query={{
        //         key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
        //         language: 'en',
        //         }}
        //         styles={{
        //         textInput: styles.textInput,
        //         flex: 1,
        //     }}
        // />
        // <Text>Destination Address</Text>
        // <GooglePlacesAutocomplete
        //     placeholder='Enter destination address'
        //     fetchDetails={true}
        //     debounce={300}
        //     onPress={(data, details = null) => {
        //     setDest(data.description);
        //     }}
        //     query={{
        //         key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
        //         language: 'en',
        //         }}
        //         styles={{
        //         textInput: styles.textInput,
        //         flex: 1,

        //     }}
        // />
        // <View style={styles.row}>
        
        //     <DateTimePicker
        //     value={date}
        //     mode="date"
        //     display="default"
        //     onChange={onChangeDate}
        //     />
        //     <DateTimePicker
        //     value={time}
        //     mode="time"
        //     display="default"
        //     onChange={onChangeTime}
        //     />
        // </View>
        
        
        // </KeyboardAvoidingView>
        
    );
    };

const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 16,
    
},
addressRow: {
    // flexDirection: 'row',
    // justifyContent: 'center',
    
},
timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
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
});

export default NewRide;
