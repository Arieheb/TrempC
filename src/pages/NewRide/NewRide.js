import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const newRide = {
            source,
            dest,
            date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),     
            driver_name: driverName,
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.container}>
                    <Text>Source Address</Text>
                    <GooglePlacesAutocomplete
                        placeholder='Enter source address'
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setSource(data.description);
                        }}
                        query={{
                            key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                            language: 'en',
                        }}
                        styles={{
                            textInput: styles.textInput,
                        }}
                    />
                    <Text>Destination Address</Text>
                    <GooglePlacesAutocomplete
                        placeholder='Enter destination address'
                        fetchDetails={true}
                        onPress={(data, details = null) => {
                            setDest(data.description);
                        }}
                        query={{
                            key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
                            language: 'en',
                        }}
                        styles={{
                            textInput: styles.textInput,
                        }}
                    />
                    <View style={styles.row}>
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
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
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

// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { auth, db } from '../../../firebaseConfig';
// import CustomButton from '../../components/CustomButton';
// import CustomInput from '../../components/CustomInput';
// import { useNavigation } from '@react-navigation/native';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import { doc, getDoc } from 'firebase/firestore';
// import { ScrollView } from 'react-native-gesture-handler';
// import { Timestamp } from 'firebase/firestore';
// import { addDoc, collection } from 'firebase/firestore';
// import { CommonActions } from '@react-navigation/native';

// const NewRide = () => {
// const [source, setSource] = useState('');
// const [dest, setDest] = useState('');
// const [date, setDate] = useState(new Date());
// const [time, setTime] = useState(new Date());
// const [showDatePicker, setShowDatePicker] = useState(false);
// const [showTimePicker, setShowTimePicker] = useState(false);
// const [driverName, setDriverName] = useState('');
// const [dPhone, setDPhone] = useState('');
// const [places, setPlaces] = useState('');
// const [cost, setCost] = useState('');
// const [comment, setComment] = useState('');
// const user = auth.currentUser;

// const navigation = useNavigation();

    

// useEffect(() => {
//         if (user) {
//             const userDoc = doc(db, "users", user.uid);
//             getDoc(userDoc).then(docSnap => {
//                 if (docSnap.exists()) {
//                     const userData = docSnap.data();
//                     const fullName = userData.firstName + " " + userData.lastName;
//                     const phoneNumber = userData.phone;
//                     setDriverName(fullName);
//                     setDPhone(userData.phone);
//                 }
//             });
//         }
//     }, []);


// const onChangeDate = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//     setDate(selectedDate);
//     }
// };

// const onChangeTime = (event, selectedTime) => {
//     setShowTimePicker(false);
//     if (selectedTime) {
//     setTime(selectedTime);
//     }
// };

// const handleSave = () => {
//     if (!source || !dest || !driverName || !dPhone) {
//     Alert.alert('Error', 'Please fill in all required fields.');
//     return;
//     }

//     const newRide = {
//     source,
//     dest,
//     date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),      driver_name: driverName,
//     dPhone,
//     places: places ? parseInt(places, 10) : 0,
//     cost: cost ? parseFloat(cost) : 0,
//     comment: comment || '',
//     userId: user.uid,
//     };

//     // db.collection('rides').add(newRide)
//     addDoc(collection(db, 'rides'), newRide)
//     .then(() => {
//         Alert.alert('Success', 'Ride added successfully!');
//         navigation.reset({
//         index: 0,
//         routes: [{ name: 'homeScreen' }],
//         });
//     })
//     .catch((error) => {
//         Alert.alert('Error', error.message);
//     });
// };

// // const handleClear = () => {
// //     setSource('');
// //     setDest('');
// //     setDate(new Date());
// //     setTime(new Date());
  
// //     // Ensure driverName and dPhone are defined before accessing trim
// //     if (driverName && driverName.trim() !== '') {
// //       setDriverName('');
// //     } else if (currentUser) {
// //       setDriverName(`${currentUser.firstName} ${currentUser.lastName}`);
// //     }
  
// //     if (dPhone && dPhone.trim() !== '') {
// //       setDPhone('');
// //     } else if (currentUser) {
// //       setDPhone(currentUser.phone);
// //     }
  
// //     setPlaces('');
// //     setCost('');
// //     setComment('');
// //   };

// const returnPress = () => {
//     navigation.dispatch(CommonActions.reset({
//         index: 0,
//         routes: [
//             { name: 'homeScreen' }
//         ],
//     }));
// };
  

// return (
    
    
//         <View style={styles.container}>
//         <Text>Source Address</Text>
//         <GooglePlacesAutocomplete
//             placeholder='Enter source address'
//             fetchDetails={true}
//             onPress={(data, details = null) => {
//             setSource(data.description);
//             }}
//             query={{
//                 key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
//                 language: 'en',
//                 }}
//                 styles={{
//                 textInput: styles.textInput,
//             }}
//         />
//         <Text>Destination Address</Text>
//         <GooglePlacesAutocomplete
//             placeholder='Enter destination address'
//             fetchDetails={true}
//             onPress={(data, details = null) => {
//             setDest(data.description);
//             }}
//             query={{
//                 key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
//                 language: 'en',
//                 }}
//                 styles={{
//                 textInput: styles.textInput,
//             }}
//         />
//         <View style={styles.row}>
        
//             <DateTimePicker
//             value={date}
//             mode="date"
//             display="default"
//             onChange={onChangeDate}
//             />
//             <DateTimePicker
//             value={time}
//             mode="time"
//             display="default"
//             onChange={onChangeTime}
//             />
//         </View>
        
//         <CustomInput
//             label="Driver Name"
//             placeholder={driverName}
//             onChangeText={setDriverName}
//         />
//         <CustomInput
//             label="Driver Phone"
//             placeholder={dPhone}
//             onChangeText={setDPhone}
//         />
//         <CustomInput
//             label="Vacant Places"
//             placeholder="Vacant Places"
//             onChangeText={setPlaces}
//             keyboardType="numeric"
//         />
//         <CustomInput
//             label="Cost"
//             placeholder="Cost"
//             onChangeText={setCost}
//             keyboardType="numeric"
//         />
//         <CustomInput
//             label="Comment"
//             placeholder="Comments"
//             onChangeText={setComment}
//         />     
        
//         <CustomButton
//             title = "Save"
//             onPress={handleSave}
//             text="Save"
//         />
        
//         <CustomButton
//             title = "Return"
//             onPress={returnPress}
//             text="Cancel"
//             type="SECONDARY"
//                 />
//         </View>
        
//     );
//     };

// const styles = StyleSheet.create({
// container: {
//     flex: 1,
//     padding: 16,
    
// },
// row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 8,
// },
// textInput: {
//     height: 40,
//     borderColor: 'gray',
//     borderWidth: 1,
//     marginBottom: 12,
//     paddingLeft: 8,
// },
// });

// export default NewRide;

// // import React, { useState, useEffect } from 'react';
// // import { View, StyleSheet, Text } from 'react-native';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { useNavigation } from '@react-navigation/native';
// // import CustomInput from '../../components/CustomInput';
// // import CustomButton from '../../components/CustomButton';
// // import { auth, db } from '../../../firebaseConfig';
// // import { addDoc, doc, getDoc } from 'firebase/firestore';
// // import { Timestamp } from 'firebase/firestore';
// // import { collection } from 'firebase/firestore';
// // import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// // import PlaceAutocomplete from '../../components/CustomMap/CustomMap';  // Adjust the path as needed
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// // const NewRideScreen = () => {
// //     const navigation = useNavigation();
// //     const [source, setSource] = useState('');
// //     const [destination, setDestination] = useState('');
// //     const [date, setDate] = useState(new Date());
// //     const [time, setTime] = useState(new Date());
// //     const [dName, setDName] = useState('');
// //     const [dNumber, setDNumber] = useState('');
// //     const [places, setPlaces] = useState('');
// //     const [comment, setComment] = useState('');
// //     const [cost, setCost] = useState(''); 
// //     const [requiredFields, setRequiredFields] = useState({
// //         source: false,
// //         destination: false,
// //         dName: false,
// //         dNumber: false,
// //     });

// //     useEffect(() => {
// //         const user = auth.currentUser;
// //         if (user) {
// //             const userDoc = doc(db, "users", user.uid);
// //             getDoc(userDoc).then(docSnap => {
// //                 if (docSnap.exists()) {
// //                     const userData = docSnap.data();
// //                     const fullName = `${userData.firstName} ${userData.lastName}`;
// //                     setDName(fullName);
// //                     setDNumber(userData.phone);
// //                 }
// //             });
// //         }
// //     }, []);

// //     const handleDateChange = (event, selectedDate) => {
// //         if (event.type === 'set') {
// //             const currentDate = selectedDate || date;
// //             setDate(currentDate);
// //         }
// //     };

// //     const handleTimeChange = (event, selectedTime) => {
// //         if (event.type === 'set') {
// //             const currentTime = selectedTime || time;
// //             setTime(currentTime);
// //         }
// //     };

// //     const checkRequiredFields = () => {
// //         return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
// //     };

// //     const handleSave = async () => {
// //         if (checkRequiredFields()) {
// //             const rideData = {
// //                 comment,
// //                 cost: parseInt(places) || 0,
// //                 date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),
// //                 source,
// //                 dest: destination,
// //                 driver_name: dName,
// //                 dPhone: dNumber,
// //                 places: parseInt(places) || 0,
// //                 joins: [],
// //             };
// //             console.log(rideData);
// //             try {
// //                 await addDoc(collection(db, 'rides'), rideData);                
// //                 navigation.reset({
// //                     index: 0,
// //                     routes: [{ name: 'homeScreen' }],
// //                 });
// //             } catch (error) {
// //                 console.error('Error adding document: ', error);
// //             }
// //         } else {
// //             setRequiredFields({
// //                 source: source === '',
// //                 destination: destination === '',
// //                 dName: dName === '',
// //                 dNumber: dNumber === '',
// //             });
// //         }
// //     };
// //     const getGooglePlacesSuggestions = async (input) => {
// //         const apiKey = 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk';
// //         const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}`;
// //         try {
// //             const response = await fetch(url);
// //             console.log("response", response);
// //             const json = await response.json();
// //             console.log("json", json);
// //             return json.predictions.map(prediction => prediction.description);
// //             console.log("predictions", predictions);
// //         } catch (error) {
// //             console.error(error);
// //             return [];
// //         }
// //     };

// //     const handleSourceChange = async (text) => {
// //         setSource(text);
// //         const suggestions = await getGooglePlacesSuggestions(text);
// //         console.log(suggestions);
// //     };

// //     const handleDestinationChange = async (text) => {
// //         setDestination(text);
// //         const suggestions = await getGooglePlacesSuggestions(text);
// //         console.log(suggestions);
// //     };

// //     const handleClear = () => {
// //         setSource('');
// //         setDestination('');
// //         setDate(new Date());
// //         setTime(new Date());
// //         setPlaces('');
// //         setComment('');
// //         setCost('');
// //         setRequiredFields({
// //             source: false,
// //             destination: false,
// //             dName: false,
// //             dNumber: false,
// //         });
// //     };

// //     const handleReturn = () => {
// //         handleClear();
// //         navigation.reset({
// //             index: 0,
// //             routes: [{ name: 'homeScreen' }],
// //         });
// //     };

// //     return (
// //         <KeyboardAwareScrollView contentContainerStyle={styles.scrollViewContainer}>
// //             <Text style={styles.headerText}>New Ride</Text>
// //             <View style = {styles.googleFind}>
// //                     <GooglePlacesAutocomplete
// //                         placeholder='Source Address'
// //                         onPress={(data, details = null) => {
// //                             // 'details' is provided when fetchDetails = true
// //                             console.log(data, details);
// //                             setSource(data.description);
// //                         }}
// //                         query={{
// //                             key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
// //                             language: 'en',
// //                         }}
// //                     />
// //                 </View>
// //                 <View style = {styles.googleFind}>
// //                     <GooglePlacesAutocomplete
// //                         placeholder='Destination Address'
// //                         style={styles.googleFind}
// //                         onPress={(data, details = null) => {
// //                             // 'details' is provided when fetchDetails = true
// //                             console.log(data, details);
// //                             setDestination(data.description);
// //                         }}
// //                         query={{
// //                             key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
// //                             language: 'en',
// //                         }}
// //                     />
// //                 </View>
// //                 <View style = {styles.container}></View>
// //             <View style={styles.container}>
// //                 <View style={styles.dateTimeRow}>
// //                     <DateTimePicker
// //                         value={date}
// //                         mode="date"
// //                         display="default"
// //                         onChange={handleDateChange}
// //                         style={styles.dateTimePicker}
// //                     />
// //                     <View style={styles.space} />
// //                     <DateTimePicker
// //                         value={time}
// //                         mode="time"
// //                         display="default"
// //                         onChange={handleTimeChange}
// //                         style={styles.dateTimePicker}
// //                     />
// //                 </View>
// //                 <CustomInput
// //                     setValue={setDName}
// //                     placeholder={dName}
// //                     style={requiredFields.dName && styles.required}
// //                 />
// //                 <CustomInput
// //                     setValue={setDNumber}
// //                     placeholder={dNumber}
// //                     style={requiredFields.dNumber && styles.required}
// //                     keyboardType="phone-pad"
// //                 />
// //                 <CustomInput
// //                     value={places}
// //                     setValue={setPlaces}
// //                     placeholder="Vacant places"
// //                     keyboardType="numeric"
// //                 />
// //                 <CustomInput
// //                     value={cost}
// //                     setValue={setCost}
// //                     placeholder="Cost"
// //                     keyboardType="numeric"
// //                 />
// //                 <CustomInput
// //                     value={comment}
// //                     setValue={setComment}
// //                     placeholder="Comments"
// //                 />
// //                 <CustomButton
// //                     onPress={handleSave}
// //                     text="Save"
// //                 />
// //                 <CustomButton
// //                     onPress={handleClear}
// //                     text="Clear"
// //                     type="SECONDARY"
// //                 />
// //                 <CustomButton
// //                     onPress={handleReturn}
// //                     text="Return"
// //                     type="SECONDARY"
// //                 />
// //             </View>
// //         </KeyboardAwareScrollView>
        
// //     );
// // };

// // const styles = StyleSheet.create({
// //     scrollViewContainer: {
// //         flexGrow: 1,
// //         paddingBottom: 20,
// //         flexDirection: 'column',
// //         justifyContent: 'center',
// //     },
// //     container: {
// //         flex: 1,
// //         // padding: 16,
// //         alignItems: 'center',
// //     },
// //     headerText: {
// //         textAlign: 'center',
// //         fontSize: 35,
// //         paddingTop: 20,
// //         fontWeight: 'bold',
// //     },
    
// //     dateTimeRow: {
// //         flexDirection: 'row',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         width: '65%',
// //         margin: 7,
// //     },
// //     dateTimePicker: {
// //         flex: 1,
// //     },
// //     space: {
// //         width: 10,
// //     },
// //     required: {
// //         borderColor: 'red',
// //         borderWidth: 1,
// //     },
// // });

// // export default NewRideScreen;

// // // import React, { useState, useEffect } from 'react';
// // // import { View, StyleSheet, Text } from 'react-native';
// // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // import { useNavigation } from '@react-navigation/native';
// // // import CustomInput from '../../components/CustomInput';
// // // import CustomButton from '../../components/CustomButton';
// // // import { auth, db } from '../../../firebaseConfig';
// // // import { addDoc, doc, getDoc } from 'firebase/firestore';
// // // import { Timestamp } from 'firebase/firestore';
// // // import { collection } from 'firebase/firestore';
// // // import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
// // // import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// // // const NewRideScreen = () => {
// // //     const navigation = useNavigation();
// // //     const [source, setSource] = useState('');
// // //     const [destination, setDestination] = useState('');
// // //     const [date, setDate] = useState(new Date());
// // //     const [time, setTime] = useState(new Date());
// // //     const [dName, setDName] = useState('');
// // //     const [dNumber, setDNumber] = useState('');
// // //     const [places, setPlaces] = useState('');
// // //     const [comment, setComment] = useState('');
// // //     const [cost, setCost] = useState(''); 
// // //     const [requiredFields, setRequiredFields] = useState({
// // //         source: false,
// // //         destination: false,
// // //         dName: false,
// // //         dNumber: false,
// // //     });

// // //     useEffect(() => {
// // //         const user = auth.currentUser;
// // //         if (user) {
// // //             const userDoc = doc(db, "users", user.uid);
// // //             getDoc(userDoc).then(docSnap => {
// // //                 if (docSnap.exists()) {
// // //                     const userData = docSnap.data();
// // //                     const fullName = `${userData.firstName} ${userData.lastName}`;
// // //                     setDName(fullName);
// // //                     setDNumber(userData.phone);
// // //                 }
// // //             });
// // //         }
// // //     }, []);

// // //     const handleDateChange = (event, selectedDate) => {
// // //         if (event.type === 'set') {
// // //             const currentDate = selectedDate || date;
// // //             setDate(currentDate);
// // //         }
// // //     };

// // //     const handleTimeChange = (event, selectedTime) => {
// // //         if (event.type === 'set') {
// // //             const currentTime = selectedTime || time;
// // //             setTime(currentTime);
// // //         }
// // //     };

// // //     const checkRequiredFields = () => {
// // //         return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
// // //     };

// // //     const handleSave = async () => {
// // //         if (checkRequiredFields()) {
// // //             const rideData = {
// // //                 comment,
// // //                 cost: parseInt(places) || 0,
// // //                 date_time: Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes())),
// // //                 source,
// // //                 dest: destination,
// // //                 driver_name: dName,
// // //                 dPhone: dNumber,
// // //                 places: parseInt(places) || 0,
// // //                 joins: [],
// // //             };
// // //             console.log(rideData);
// // //             try {
// // //                 await addDoc(collection(db, 'rides'), rideData);                
// // //                 navigation.reset({
// // //                     index: 0,
// // //                     routes: [{ name: 'homeScreen' }],
// // //                 });
// // //             } catch (error) {
// // //                 console.error('Error adding document: ', error);
// // //             }
// // //         } else {
// // //             setRequiredFields({
// // //                 source: source === '',
// // //                 destination: destination === '',
// // //                 dName: dName === '',
// // //                 dNumber: dNumber === '',
// // //             });
// // //         }
// // //     };

// // //     const handleClear = () => {
// // //         setSource('');
// // //         setDestination('');
// // //         setDate(new Date());
// // //         setTime(new Date());
// // //         setPlaces('');
// // //         setComment('');
// // //         setCost('');
// // //         setRequiredFields({
// // //             source: false,
// // //             destination: false,
// // //             dName: false,
// // //             dNumber: false,
// // //         });
// // //     };

// // //     const handleReturn = () => {
// // //         handleClear();
// // //         navigation.reset({
// // //             index: 0,
// // //             routes: [{ name: 'homeScreen' }],
// // //         });
// // //     };

// // //     const getGooglePlacesSuggestions = async (input) => {
// // //         const apiKey = 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk';
// // //         const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}`;
// // //         try {
// // //             const response = await fetch(url);
// // //             const json = await response.json();
// // //             return json.predictions.map(prediction => prediction.description);
// // //         } catch (error) {
// // //             console.error(error);
// // //             return [];
// // //         }
// // //     };

// // //     const handleSourceChange = async (text) => {
// // //         setSource(text);
// // //         const suggestions = await getGooglePlacesSuggestions(text);
// // //         console.log(suggestions);
// // //     };

// // //     const handleDestinationChange = async (text) => {
// // //         setDestination(text);
// // //         const suggestions = await getGooglePlacesSuggestions(text);
// // //         console.log(suggestions);
// // //     };

// // //     return (
// // //         <KeyboardAwareScrollView contentContainerStyle={styles.scrollViewContainer}>
// // //             <Text style={styles.headerText}>New Ride</Text>
// // //             <View style={styles.googleFind}>
// // //                 <GooglePlacesAutocomplete
// // //                     placeholder='Source Address'
// // //                     onPress={(data, details = null) => {
// // //                         console.log(data, details);
// // //                         setSource(data.description);
// // //                     }}
// // //                     query={{
// // //                         key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
// // //                         language: 'en',
// // //                     }}
// // //                     styles={{
// // //                         textInputContainer: styles.textInputContainer,
// // //                         textInput: styles.textInput,
// // //                     }}
// // //                 />
// // //             </View>
// // //             <View style={styles.googleFind}>
// // //                 <GooglePlacesAutocomplete
// // //                     placeholder='Destination Address'
// // //                     onPress={(data, details = null) => {
// // //                         console.log(data, details);
// // //                         setDestination(data.description);
// // //                     }}
// // //                     query={{
// // //                         key: 'AIzaSyBAJPGIdDzvvJP6Wos4PgwaKP4A2FZ2Nlk',
// // //                         language: 'en',
// // //                     }}
// // //                     styles={{
// // //                         textInputContainer: styles.textInputContainer,
// // //                         textInput: styles.textInput,
// // //                     }}
// // //                 />
// // //             </View>
// // //             <View style={styles.container}>
// // //                 <View style={styles.dateTimeRow}>
// // //                     <DateTimePicker
// // //                         value={date}
// // //                         mode="date"
// // //                         display="default"
// // //                         onChange={handleDateChange}
// // //                         style={styles.dateTimePicker}
// // //                     />
// // //                     <View style={styles.space} />
// // //                     <DateTimePicker
// // //                         value={time}
// // //                         mode="time"
// // //                         display="default"
// // //                         onChange={handleTimeChange}
// // //                         style={styles.dateTimePicker}
// // //                     />
// // //                 </View>
// // //                 <CustomInput
// // //                     setValue={setDName}
// // //                     placeholder={dName}
// // //                     style={requiredFields.dName && styles.required}
// // //                 />
// // //                 <CustomInput
// // //                     setValue={setDNumber}
// // //                     placeholder={dNumber}
// // //                     style={requiredFields.dNumber && styles.required}
// // //                     keyboardType="phone-pad"
// // //                 />
// // //                 <CustomInput
// // //                     value={places}
// // //                     setValue={setPlaces}
// // //                     placeholder="Vacant places"
// // //                     keyboardType="numeric"
// // //                 />
// // //                 <CustomInput
// // //                     value={cost}
// // //                     setValue={setCost}
// // //                     placeholder="cost"
// // //                     keyboardType="numeric"
// // //                 />
// // //                 <CustomInput
// // //                     value={comment}
// // //                     setValue={setComment}
// // //                     placeholder="Comments"
// // //                 />
// // //                 <CustomButton
// // //                     onPress={handleSave}
// // //                     text="Save"
// // //                 />
// // //                 <CustomButton
// // //                     onPress={handleClear}
// // //                     text="Clear"
// // //                     type="SECONDARY"
// // //                 />
// // //                 <CustomButton
// // //                     onPress={handleReturn}
// // //                     text="Return"
// // //                     type="SECONDARY"
// // //                 />
// // //             </View>
// // //         </KeyboardAwareScrollView>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     scrollViewContainer: {
// // //         flexGrow: 1,
// // //         paddingBottom: 20,
// // //         flexDirection: 'column',
// // //         justifyContent: 'center',
        
// // //     },
// // //     container: {
// // //         flex: 1,
// // //         padding: 16,
// // //         alignItems: 'center',
// // //     },
// // //     headerText: {
// // //         textAlign: 'center',
// // //         fontSize: 35,
// // //         paddingTop: 20,
// // //         fontWeight: 'bold',
// // //     },
// // //     googleFind: {
// // //         width: 'center', 
// // //         margin: 10, 
// // //         borderColor: 'black',
// // //         borderWidth: 1,
// // //         borderRadius: 5,
// // //         // paddingHorizontal: 10,
// // //         // marginVertical: 7
// // //     },
// // //     dateTimeRow: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         width: '65%',
// // //         margin: 7,
// // //     },
// // //     dateTimePicker: {
// // //         flex: 1,
// // //     },
// // //     space: {
// // //         width: 10,
// // //     },
// // //     required: {
// // //         borderColor: 'red',
// // //         borderWidth: 1,
// // //     },
// // // });

// // // export default NewRideScreen;
