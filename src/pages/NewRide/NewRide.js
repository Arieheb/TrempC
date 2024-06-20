import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const NewRideScreen = () => {
    const navigation = useNavigation();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [dName, setDName] = useState('');
    const [dNumber, setDNumber] = useState('');
    const [places, setPlaces] = useState('');
    const [comment, setComment] = useState('');
    const [requiredFields, setRequiredFields] = useState({
        source: false,
        destination: false,
        dName: false,
        dNumber: false,
    });

    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'set') {
            const currentDate = selectedDate || date;
            setDate(currentDate);
            setShowDatePicker(false); // Close date picker after selecting a date
        } else {
            setShowDatePicker(false); // Close date picker if canceled
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        if (event.type === 'set') {
            const currentTime = selectedTime || time;
            setTime(currentTime);
            setShowTimePicker(false); // Close time picker after selecting a time
        }
    };

    const checkRequiredFields = () => {
        return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
    };

    const handleSave = () => {
        if (checkRequiredFields()) {
            console.log("saved");
            navigation.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }],
            });
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
        setDName('');
        setDNumber('');
        setPlaces('');
        setComment('');
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

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.container}>
                <CustomInput
                    value={source}
                    setValue={setSource}
                    placeholder="Source Address"
                    style={requiredFields.source && styles.required}
                />
                <CustomInput
                    value={destination}
                    setValue={setDestination}
                    placeholder="Destination Address"
                    style={requiredFields.destination && styles.required}
                />
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
                    value={dName}
                    setValue={setDName}
                    placeholder="Driver's Name"
                    style={requiredFields.dName && styles.required}
                />
                <CustomInput
                    value={dNumber}
                    setValue={setDNumber}
                    placeholder="Driver's Phone Number"
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
                    value={comment}
                    setValue={setComment}
                    placeholder="Comments"
                />
                <CustomButton
                    onPress={handleSave}
                    text="Save"
                    bgColor={checkRequiredFields() ? 'green' : 'lightgrey'}
                    fgColor="white"
                    disabled={!checkRequiredFields()}
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
     dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    dateTimePicker: {
        flex: 1,
    },
    space: {
        width: -10,
    },
    required: {
        borderColor: 'red',
    },
});

export default NewRideScreen;

// import React, { useState } from 'react';
// import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useNavigation } from '@react-navigation/native';
// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';

// const NewRideScreen = () => {
//     const navigation = useNavigation();
//     const [source, setSource] = useState('');
//     const [destination, setDestination] = useState('');
//     const [date, setDate] = useState(new Date());
//     const [time, setTime] = useState(new Date());
//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [showTimePicker, setShowTimePicker] = useState(false);
//     const [dName, setDName] = useState('');
//     const [dNumber, setDNumber] = useState('');
//     const [places, setPlaces] = useState('');
//     const [comment, setComment] = useState('');
//     const [requiredFields, setRequiredFields] = useState({
//         source: false,
//         destination: false,
//         dName: false,
//         dNumber: false,
//     });

//     const handleDateChange = (event, selectedDate) => {
//         if (event.type === 'set') {
//             const currentDate = selectedDate || date;
//             setDate(currentDate);
//             setShowDatePicker(false); // Close date picker after selecting a date
//         } else {
//             setShowDatePicker(false); // Close date picker if canceled
//         }
//     };

//     const handleTimeChange = (event, selectedTime) => {
//         if (event.type === 'set') {
//             const currentTime = selectedTime || time;
//             setTime(currentTime);
//             setShowTimePicker(false); // Close time picker after selecting a time
//         }
//     };

//     const checkRequiredFields = () => {
//         return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
//     };

//     const handleSave = () => {
//         if (checkRequiredFields()) {
//             console.log("saved");
//             navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'homeScreen' }],
//             });
//         } else {
//             setRequiredFields({
//                 source: source === '',
//                 destination: destination === '',
//                 dName: dName === '',
//                 dNumber: dNumber === '',
//             });
//         }
//     };

//     const handleClear = () => {
//         setSource('');
//         setDestination('');
//         setDate(new Date());
//         setTime(new Date());
//         setDName('');
//         setDNumber('');
//         setPlaces('');
//         setComment('');
//         setRequiredFields({
//             source: false,
//             destination: false,
//             dName: false,
//             dNumber: false,
//         });
//     };

//     const handleReturn = () => {
//         handleClear();
//         navigation.reset({
//             index: 0,
//             routes: [{ name: 'homeScreen' }],
//         });
//     };

//     return (
//         <ScrollView contentContainerStyle={styles.scrollViewContainer}>
//             <View style={styles.container}>
//                 <CustomInput
//                     value={source}
//                     setValue={setSource}
//                     placeholder="Source Address"
//                     style={requiredFields.source && styles.required}
//                 />
//                 <CustomInput
//                     value={destination}
//                     setValue={setDestination}
//                     placeholder="Destination Address"
//                     style={requiredFields.destination && styles.required}
//                 />
//                 <View style={styles.dateTimeRow}>
//                     <TouchableOpacity
//                         onPress={() => setShowDatePicker(true)}
//                         style={styles.dateTimeButton}
//                     >
//                         <Text style={styles.buttonText}>{`Date: ${date.toLocaleDateString()}`}</Text>
//                     </TouchableOpacity>
//                     <View style={styles.space} />
//                     <TouchableOpacity
//                         onPress={() => setShowTimePicker(true)}
//                         style={styles.dateTimeButton}
//                     >
//                         <Text style={styles.buttonText}>{`Time: ${time.toLocaleTimeString()}`}</Text>
//                     </TouchableOpacity>
//                 </View>
//                 {showDatePicker && (
//                     <DateTimePicker
//                         value={date}
//                         mode="date"
//                         display="default"
//                         onChange={handleDateChange}
//                     />
//                 )}
//                 {showTimePicker && (
//                     <DateTimePicker
//                         value={time}
//                         mode="time"
//                         display="default"
//                         onChange={handleTimeChange}
//                     />
//                 )}
//                 <CustomInput
//                     value={dName}
//                     setValue={setDName}
//                     placeholder="Driver's Name"
//                     style={requiredFields.dName && styles.required}
//                 />
//                 <CustomInput
//                     value={dNumber}
//                     setValue={setDNumber}
//                     placeholder="Driver's Phone Number"
//                     style={requiredFields.dNumber && styles.required}
//                     keyboardType="phone-pad"
//                 />
//                 <CustomInput
//                     value={places}
//                     setValue={setPlaces}
//                     placeholder="Vacant places"
//                     keyboardType="numeric"
//                 />
//                 <CustomInput
//                     value={comment}
//                     setValue={setComment}
//                     placeholder="Comments"
//                 />
//                 <CustomButton
//                     onPress={handleSave}
//                     text="Save"
//                     bgColor={checkRequiredFields() ? 'green' : 'lightgrey'}
//                     fgColor="white"
//                     disabled={!checkRequiredFields()}
//                 />
//                 <CustomButton
//                     onPress={handleClear}
//                     text="Clear"
//                     type="SECONDARY"
//                 />
//                 <CustomButton
//                     onPress={handleReturn}
//                     text="Return"
//                     type="SECONDARY"
//                 />
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     scrollViewContainer: {
//         flexGrow: 1,
//         paddingBottom: 20,
//     },
//     container: {
//         flex: 1,
//         padding: 16,
//         alignItems: 'center',
//     },
//     dateTimeRow: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         width: '100%',
//         marginBottom: 12,
//     },
//     dateTimeButton: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#3B71F3',
//         borderRadius: 10,
//         paddingVertical: 12,
//     },
//     buttonText: {
//         color: 'white',
//         fontWeight: 'bold',
//     },
//     space: {
//         width: 20,
//     },
//     required: {
//         borderColor: 'red',
//     },
// });

// export default NewRideScreen;

// // import React, { useState } from 'react';
// // import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
// // import DateTimePicker from '@react-native-community/datetimepicker';
// // import { useNavigation } from '@react-navigation/native';
// // import CustomInput from '../../components/CustomInput';
// // import CustomButton from '../../components/CustomButton';

// // const NewRideScreen = () => {
// //     const navigation = useNavigation();
// //     const [source, setSource] = useState('');
// //     const [destination, setDestination] = useState('');
// //     const [date, setDate] = useState(new Date());
// //     const [time, setTime] = useState(new Date());
// //     const [showDatePicker, setShowDatePicker] = useState(false);
// //     const [showTimePicker, setShowTimePicker] = useState(false);
// //     const [dName, setDName] = useState('');
// //     const [dNumber, setDNumber] = useState('');
// //     const [places, setPlaces] = useState('');
// //     const [comment, setComment] = useState('');
// //     const [requiredFields, setRequiredFields] = useState({
// //         source: false,
// //         destination: false,
// //         dName: false,
// //         dNumber: false,
// //     });

// //     const handleDateChange = (event, selectedDate) => {
// //         if (event.type === 'set') {
// //             const currentDate = selectedDate || date;
// //             setDate(currentDate);
// //             setShowDatePicker(false); // Close date picker after selecting a date
// //         } else {
// //             setShowDatePicker(false); // Close date picker if canceled
// //         }
// //     };

// //     const handleTimeChange = (event, selectedTime) => {
// //         if (event.type === 'set') {
// //             const currentTime = selectedTime || time;
// //             setTime(currentTime);
// //         }
// //     };

// //     const handleTimeConfirm = () => {
// //         setShowTimePicker(false); // Close time picker after confirming time selection
// //     };

// //     const checkRequiredFields = () => {
// //         return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
// //     };

// //     const handleSave = () => {
// //         if (checkRequiredFields()) {
// //             console.log("saved");
// //             navigation.reset({
// //                 index: 0,
// //                 routes: [{ name: 'homeScreen' }],
// //             });
// //         } else {
// //             setRequiredFields({
// //                 source: source === '',
// //                 destination: destination === '',
// //                 dName: dName === '',
// //                 dNumber: dNumber === '',
// //             });
// //         }
// //     };

// //     const handleClear = () => {
// //         setSource('');
// //         setDestination('');
// //         setDate(new Date());
// //         setTime(new Date());
// //         setDName('');
// //         setDNumber('');
// //         setPlaces('');
// //         setComment('');
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
// //         <ScrollView contentContainerStyle={styles.scrollViewContainer}>
// //             <View style={styles.container}>
// //                 <CustomInput
// //                     value={source}
// //                     setValue={setSource}
// //                     placeholder="Source Address"
// //                     style={requiredFields.source && styles.required}
// //                 />
// //                 <CustomInput
// //                     value={destination}
// //                     setValue={setDestination}
// //                     placeholder="Destination Address"
// //                     style={requiredFields.destination && styles.required}
// //                 />
// //                 <View style={styles.dateTimeRow}>
// //                     <TouchableOpacity
// //                         onPress={() => setShowDatePicker(true)}
// //                         style={styles.dateTimeButton}
// //                     >
// //                         <Text style={styles.buttonText}>{`Date: ${date.toLocaleDateString()}`}</Text>
// //                     </TouchableOpacity>
// //                     <View style={styles.space} />
// //                     <TouchableOpacity
// //                         onPress={() => setShowTimePicker(true)}
// //                         style={styles.dateTimeButton}
// //                     >
// //                         <Text style={styles.buttonText}>{`Time: ${time.toLocaleTimeString()}`}</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //                 {showDatePicker && (
// //                     <DateTimePicker
// //                         value={date}
// //                         mode="date"
// //                         display="default"
// //                         onChange={handleDateChange}
// //                     />
// //                 )}
// //                 {showTimePicker && (
// //                     <View>
// //                         <DateTimePicker
// //                             value={time}
// //                             mode="time"
// //                             display="default"
// //                             onChange={handleTimeChange}
// //                         />
// //                         <CustomButton
// //                             onPress={handleTimeConfirm}
// //                             text="Confirm"
// //                             style={styles.confirmButton}
// //                         />
// //                     </View>
// //                 )}
// //                 <CustomInput
// //                     value={dName}
// //                     setValue={setDName}
// //                     placeholder="Driver's Name"
// //                     style={requiredFields.dName && styles.required}
// //                 />
// //                 <CustomInput
// //                     value={dNumber}
// //                     setValue={setDNumber}
// //                     placeholder="Driver's Phone Number"
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
// //                     value={comment}
// //                     setValue={setComment}
// //                     placeholder="Comments"
// //                 />
// //                 <CustomButton
// //                     onPress={handleSave}
// //                     text="Save"
// //                     bgColor={checkRequiredFields() ? 'green' : 'lightgrey'}
// //                     fgColor="white"
// //                     disabled={!checkRequiredFields()}
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
// //         </ScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     scrollViewContainer: {
// //         flexGrow: 1,
// //         paddingBottom: 20,
// //     },
// //     container: {
// //         flex: 1,
// //         padding: 16,
// //         alignItems: 'center',
// //     },
// //     dateTimeRow: {
// //         flexDirection: 'row',
// //         justifyContent: 'center',
// //         width: '100%',
// //         marginBottom: 12,
// //     },
// //     dateTimeButton: {
// //         flex: 1,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         backgroundColor: '#3B71F3',
// //         borderRadius: 10,
// //         paddingVertical: 12,
// //     },
// //     buttonText: {
// //         color: 'white',
// //         fontWeight: 'bold',
// //     },
// //     space: {
// //         width: 20,
// //     },
// //     confirmButton: {
// //         marginTop: 12,
// //         alignSelf: 'center',
// //     },
// //     required: {
// //         borderColor: 'red',
// //     },
// // });

// // export default NewRideScreen;

// // // import React, { useState } from 'react';
// // // import { View, StyleSheet } from 'react-native';
// // // import DateTimePicker from '@react-native-community/datetimepicker';
// // // import { useNavigation } from '@react-navigation/native';
// // // import CustomInput from '../../components/CustomInput';
// // // import CustomButton from '../../components/CustomButton';
// // // import { ScrollView } from 'react-native-gesture-handler';

// // // const NewRideScreen = () => {
// // //     const navigation = useNavigation();
// // //     const [source, setSource] = useState('');
// // //     const [destination, setDestination] = useState('');
// // //     const [date, setDate] = useState(new Date());
// // //     const [time, setTime] = useState(new Date());
// // //     const [showDatePicker, setShowDatePicker] = useState(false);
// // //     const [showTimePicker, setShowTimePicker] = useState(false);
// // //     const [dName, setDName] = useState(''); // Assume this is user's first name initially
// // //     const [dNumber, setDNumber] = useState(''); // Assume this is user's phone number initially
// // //     const [places, setPlaces] = useState('');
// // //     const [comment, setComment] = useState('');
    
// // //     const [requiredFields, setRequiredFields] = useState({
// // //         source: false,
// // //         destination: false,
// // //         dName: false,
// // //         dNumber: false,
// // //     });

// // //     const handleDateChange = (event, selectedDate) => {
// // //         if (event.type === 'set') {
// // //             const currentDate = selectedDate || date;
// // //             setDate(currentDate);
// // //         }
// // //         setShowDatePicker(false);
// // //     };

// // //     const handleTimeChange = (event, selectedTime) => {
// // //         if (event.type === 'set') {
// // //             const currentTime = selectedTime || time;
// // //             setTime(currentTime);
// // //         }
// // //         setShowTimePicker(false);
// // //     };

// // //     const checkRequiredFields = () => {
// // //         return source !== '' && destination !== '' && dName !== '' && dNumber !== '';
// // //     };

// // //     const handleSave = () => {
// // //         if (checkRequiredFields()) {
// // //             console.log("saved");
// // //             navigation.reset({
// // //                 index: 0,
// // //                 routes: [{ name: 'homeScreen' }],
// // //             });
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
// // //         setDName('');
// // //         setDNumber('');
// // //         setPlaces('');
// // //         setComment('');
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

// // //     return (
// // //         <ScrollView >
// // //         <View style={styles.container}>
// // //             <CustomInput
// // //                 value={source}
// // //                 setValue={setSource}
// // //                 placeholder="Source Address"
// // //                 style={requiredFields.source && styles.required}
// // //             />
// // //             <CustomInput
// // //                 value={destination}
// // //                 setValue={setDestination}
// // //                 placeholder="Destination Address"
// // //                 style={requiredFields.destination && styles.required}
// // //             />
// // //             <View style={styles.dateTimeRow}>
// // //                 <CustomButton
// // //                     onPress={() => setShowDatePicker(true)}
// // //                     text={`Date: ${date.toLocaleDateString()}`}
// // //                     style={styles.dateTimeButton}
// // //                 />
// // //                 <View style={styles.space} />
// // //                 <CustomButton
// // //                     onPress={() => setShowTimePicker(true)}
// // //                     text={`Time: ${time.toLocaleTimeString()}`}
// // //                     style={styles.dateTimeButton}
// // //                 />
// // //             </View>
// // //             {showDatePicker && (
// // //                 <DateTimePicker
// // //                     value={date}
// // //                     mode="date"
// // //                     display="default"
// // //                     onChange={handleDateChange}
// // //                 />
// // //             )}
// // //             {showTimePicker && (
// // //                 <DateTimePicker
// // //                     value={time}
// // //                     mode="time"
// // //                     display="default"
// // //                     onChange={handleTimeChange}
// // //                 />
// // //             )}
// // //             <CustomInput
// // //                 value={dName}
// // //                 setValue={setDName}
// // //                 placeholder="Driver's Name"
// // //                 style={requiredFields.dName && styles.required}
// // //             />
// // //             <CustomInput
// // //                 value={dNumber}
// // //                 setValue={setDNumber}
// // //                 placeholder="Driver's Phone Number"
// // //                 style={requiredFields.dNumber && styles.required}
// // //                 keyboardType="phone-pad"
// // //             />
// // //             <CustomInput
// // //                 value={places}
// // //                 setValue={setPlaces}
// // //                 placeholder="Vacant places"
// // //                 keyboardType="numeric"
// // //             />
// // //             <CustomInput
// // //                 value={comment}
// // //                 setValue={setComment}
// // //                 placeholder="Comments"
// // //             />
// // //             <CustomButton
// // //                 onPress={handleSave}
// // //                 text="Save"
// // //                 bgColor={checkRequiredFields() ? 'green' : 'lightgrey'}
// // //                 fgColor="white"
// // //                 disabled={!checkRequiredFields()}
// // //             />
// // //             <CustomButton
// // //                 onPress={handleClear}
// // //                 text="Clear"
// // //                 type="SECONDARY"
// // //             />
// // //             <CustomButton
// // //                 onPress={handleReturn}
// // //                 text="Return"
// // //                 type="SECONDARY"
// // //             />
// // //             </View>
// // //         </ScrollView>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         padding: 16,
// // //         alignItems: 'center',
// // //     },
// // //     dateTimeRow: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'center',
// // //         width: '45%',
// // //         marginBottom: 12,
// // //     },
// // //     dateTimeButton: {
// // //         flex: 1,
// // //     },
// // //     space: {
// // //         width: 30,
// // //     },
// // //     required: {
// // //         borderColor: 'red',
// // //     },
// // // });

// // // export default NewRideScreen;
