import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { db, auth } from '../../../firebaseConfig';
import { updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useActionSheet } from '@expo/react-native-action-sheet';
import UploadPhoto from '../../components/UploadImage/UploadImage';


const signOutNow = (navigation) => {
    auth.signOut().then(() => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'loginScreen' }
            ],
        })
        )
    }).catch((error) => {
        Alert.alert("Error signing out:", error.message);
    });
}

const Profile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialData, setInitialData] = useState({});
    const [image, setImage] = useState(null);
    const navigation = useNavigation();
    const hasFetchedData = useRef(false); // Use ref to control fetching
    const { showActionSheetWithOptions } = useActionSheet(); // Use action sheet hook

    const user = auth.currentUser;

    useEffect(() => {
        if (user && !hasFetchedData.current) {
            const uID = user.uid;
            const userDoc = doc(db, "users", uID);

            const getUserData = async () => {
                try {
                    const userDocSnap = await getDoc(userDoc);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setFirstName(userData.firstName);
                        setLastName(userData.lastName);
                        setEmail(userData.email);
                        setPhone(userData.phone);
                        setPassword(userData.password);
                        setInitialData(userData);
                        hasFetchedData.current = true; // Set ref to true after fetching
                    }
                } catch (error) {
                    Alert.alert("Error fetching user data:", error.message);
                }
            };
            getUserData();
        }
    }, [user]);

    const saveDataPress = async () => {
        const hasChanges = 
            firstName !== initialData.firstName || 
            lastName !== initialData.lastName || 
            phone !== initialData.phone || 
            email !== initialData.email || 
            password !== initialData.password;

        if (!hasChanges) {
            Alert.alert("No changes made.");
            return;
        }

        const userUpdates = {};
        if (firstName !== initialData.firstName) {
            userUpdates.firstName = firstName;
        }
        if (lastName !== initialData.lastName) {
            userUpdates.lastName = lastName;
        }
        if (phone !== initialData.phone) {
            userUpdates.phone = phone;
        }
        if (Object.keys(userUpdates).length > 0) {
            await setDoc(userDoc, userUpdates, { merge: true });
        }

        if (email !== initialData.email) {
            try {
                await updateEmail(auth.currentUser, email);
                await setDoc(userDoc, { email: email }, { merge: true });
            } catch (error) {
                Alert.alert("Error updating email:", error.message);
            }
        }

        if (password && password !== initialData.password) {
            try {
                await updatePassword(auth.currentUser, password);
            } catch (error) {
                Alert.alert("Error updating password:", error.message);
            }
        }

        Alert.alert("Changes saved successfully!");
        navigation.navigate('homeScreen');
    };

    const returnPress = () => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'homeScreen' }
            ],
        }));
    };

    const showActionSheet = () => {
        const options = ['Upload from Gallery', 'Take a Picture', 'Cancel'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    // Logic for uploading from gallery
                    uploadFromGallery();
                } else if (buttonIndex === 1) {
                    // Logic for taking a picture
                    takePicture();
                }
            }
        );
    };

    const uploadFromGallery = () => {
        // Implement logic to upload from gallery
        // setImage(yourImageFromGallery);
    };

    const takePicture = () => {
        // Implement logic to take a picture
        // setImage(yourNewPicture);
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <UploadPhoto 
                    user={email} 
                    image={image} 
                    onPress={showActionSheet} />
                
                <CustomInput 
                    placeholder={firstName} 
                    setValue={setFirstName} />
                
                <CustomInput 
                    placeholder={lastName} 
                    setValue={setLastName} />
                
                <CustomInput 
                    placeholder={phone} 
                    setValue={setPhone} />
                
                <CustomInput 
                    placeholder="Password" 
                    secureTextEntry={true} 
                    setValue={setPassword} />
                
                <CustomButton 
                    text="Save Changes" 
                    onPress={saveDataPress} 
                    bgColor={'green'} />
                
                <CustomButton 
                    text="Return" 
                    onPress={returnPress} 
                    bgColor={'red'} />
                
                <CustomButton 
                    text="Sign Out" 
                    onPress={() => signOutNow(navigation)} 
                    bgColor={'lightgrey'} 
                    fgColor={'black'} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 10
    },
    input: {
        height: 40,
        borderRadius: 12,
        paddingRight: 10,
        margin: 5,
        paddingLeft: 7,
        borderWidth: 1,
        textAlign: 'right',
    },
});

export default Profile;

// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
// import { CommonActions, useNavigation } from '@react-navigation/native';
// import { db, auth } from '../../../firebaseConfig';
// import { updateEmail, updatePassword } from "firebase/auth";
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';
// import UploadImage from '../../components/UploadImage/UploadImage';

// const signOutNow = (navigation) => {
//     auth.signOut().then(() => {
//         navigation.dispatch(CommonActions.reset({
//             index: 0,
//             routes: [
//                 { name: 'homeScreen' }
//             ],
//         }))
//     }).catch((error) => {
//         Alert.alert("Error signing out:", error.message);
//     });
// }

// const Profile = (props) => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [initialData, setInitialData] = useState({});
//     const navigation = useNavigation();

//     const uID = auth.currentUser.uid;
//     const userDoc = doc(db, "users", uID);

//     useEffect(() => {
//         const getUserData = async () => {
//             const userDocSnap = await getDoc(userDoc);
//             if (userDocSnap.exists()) {
//                 const userData = userDocSnap.data();
//                 setFirstName(userData.firstName);
//                 setLastName(userData.lastName);
//                 setEmail(userData.email);
//                 setPhone(userData.phone);
//                 setPassword(userData.password);
//                 setInitialData(userData); // Save the initial data for change detection
//             }
//         };
//         getUserData();
//     }, []);


//     const saveDataPress = async () => {
//         const hasChanges = 
//             firstName !== initialData.firstName || 
//             lastName !== initialData.lastName || 
//             phone !== initialData.phone || 
//             email !== initialData.email || 
//             password !== initialData.password;

//         if (!hasChanges) {
//             Alert.alert("No changes made.");
//             return;
//         }

//         const userUpdates = {};
//         if (firstName !== initialData.firstName) {
//             userUpdates.firstName = firstName;
//         }
//         if (lastName !== initialData.lastName) {
//             userUpdates.lastName = lastName;
//         }
//         if (phone !== initialData.phone) {
//             userUpdates.phone = phone;
//         }
//         if (Object.keys(userUpdates).length > 0) {
//             await setDoc(userDoc, userUpdates, { merge: true });
//         }

//         if (email !== initialData.email) {
//             try {
//                 await updateEmail(auth.currentUser, email);
//                 await setDoc(userDoc, { email: email }, { merge: true });
//             } catch (error) {
//                 Alert.alert("Error updating email:", error.message);
//             }
//         }

//         if (password) {
//             try {
//                 await updatePassword(auth.currentUser, password);
//             } catch (error) {
//                 Alert.alert("Error updating password:", error.message);
//             }
//         }

//         Alert.alert("Changes saved successfully!");
//         navigation.dispatch(CommonActions.reset({
//             index: 0,
//             routes: [
//                 { name: 'homeScreen' }
//             ],
//         }));
//     };

//     const returnPress = () => {
//         navigation.navigate('homeScreen');
//     };

//     return (
//         <ScrollView>
//             <View style={styles.container}>
//                 <UploadImage user={{ id: uID, pic: initialData.pic }} />
//                 <CustomInput 
//                     placeholder={firstName} 
//                     setValue={setFirstName}
//                 />
//                 <CustomInput 
//                     placeholder={lastName} 
//                     setValue={setLastName} 
//                 />
//                 <CustomInput 
//                     placeholder={email}
//                     setValue={setEmail} 
//                 />
//                 <CustomInput 
//                     placeholder={phone} 
//                     setValue={setPhone} 
//                 />
//                 <CustomInput 
//                     placeholder={password} 
//                     setValue={setPassword} 
//                 />
//                 <CustomButton 
//                     text="Save Changes" 
//                     onPress={saveDataPress} 
//                     bgColor={'green'} 
//                 />
//                 <CustomButton 
//                     text="Return" 
//                     onPress={returnPress} 
//                     bgColor={'red'} 
//                 />
//                 <CustomButton 
//                     text="Sign Out" 
//                     onPress={() => signOutNow(navigation)} 
//                     bgColor={'lightgrey'}
//                     fgColor={'black'} 
//                 />     
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         paddingHorizontal: 10
//     },
//     input: {
//         height: 40,
//         borderRadius: 12,
//         paddingRight: 10,
//         margin: 5,
//         paddingLeft: 7,
//         borderWidth: 1,
//         textAlign: 'right',
//     },
// });

// export default Profile;

// // import React, { useState, useEffect } from 'react';
// // import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
// // import { CommonActions, useNavigation } from '@react-navigation/native';
// // import { db, auth } from '../../../firebaseConfig';
// // import { updateEmail, updatePassword } from "firebase/auth";
// // import { doc, getDoc, setDoc } from 'firebase/firestore';
// // import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// // import CustomInput from '../../components/CustomInput';
// // import CustomButton from '../../components/CustomButton';

// // const signOutNow = (navigation) => {
// //     auth.signOut().then(() => {
// //         navigation.replace('login');
// //     }).catch((error) => {
// //         Alert.alert("Error signing out:", error.message);
// //     });
// // }

// // const Profile = (props) => {
// //     const [email, setEmail] = useState('');
// //     const [password, setPassword] = useState('');
// //     const [firstName, setFirstName] = useState('');
// //     const [lastName, setLastName] = useState('');
// //     const [phone, setPhone] = useState('');
// //     const [initialData, setInitialData] = useState({});
// //     const navigation = useNavigation();

// //     const uID = auth.currentUser.uid;
// //     const userDoc = doc(db, "users", uID);

// //     useEffect(() => {
// //         const getUserData = async () => {
// //             const userDocSnap = await getDoc(userDoc);
// //             if (userDocSnap.exists()) {
// //                 const userData = userDocSnap.data();
// //                 setFirstName(userData.firstName);
// //                 setLastName(userData.lastName);
// //                 setEmail(userData.email);
// //                 setPhone(userData.phone);
// //                 setPassword(userData.password);
// //                 setInitialData(userData); // Save the initial data for change detection
// //             }
// //         };
// //         getUserData();
// //     }, []);

// //     const saveDataPress = async () => {
// //         const hasChanges = 
// //             firstName !== initialData.firstName || 
// //             lastName !== initialData.lastName || 
// //             phone !== initialData.phone || 
// //             email !== initialData.email || 
// //             password !== initialData.password;

// //         if (!hasChanges) {
// //             Alert.alert("No changes made.");
// //             return;
// //         }

// //         const userUpdates = {};
// //         if (firstName !== initialData.firstName) {
// //             userUpdates.firstName = firstName;
// //         }
// //         if (lastName !== initialData.lastName) {
// //             userUpdates.lastName = lastName;
// //         }
// //         if (phone !== initialData.phone) {
// //             userUpdates.phone = phone;
// //         }
// //         if (Object.keys(userUpdates).length > 0) {
// //             await setDoc(userDoc, userUpdates, { merge: true });
// //         }

// //         if (email !== initialData.email) {
// //             try {
// //                 await updateEmail(auth.currentUser, email);
// //                 await setDoc(userDoc, { email: email }, { merge: true });
// //             } catch (error) {
// //                 Alert.alert("Error updating email:", error.message);
// //             }
// //         }

// //         if (password) {
// //             try {
// //                 await updatePassword(auth.currentUser, password);
// //             } catch (error) {
// //                 Alert.alert("Error updating password:", error.message);
// //             }
// //         }

// //         Alert.alert("Changes saved successfully!");
// //         navigation.dispatch(CommonActions.reset({
// //             index: 0,
// //             routes: [
// //                 { name: 'homeScreen' }
// //             ],
// //         }));
// //     };

// //     const returnPress = () => {
// //         navigation.navigate('homeScreen');
// //     };

// //     return (
// //         <KeyboardAwareScrollView>
// //             <View style={styles.container}>
// //                 <View style={styles.headName}>
// //                     {/* Placeholder for profile picture */}
// //                     <Text style={{ fontSize: 30, color: 'black' }}>{firstName} {lastName}</Text>
// //                 </View>
// //                 <View style={styles.itemLayout}>
// //                     <Text style={styles.textStyle}>First Name:</Text>
// //                     <CustomInput
// //                         placeholder={firstName}
// //                         setValue={setFirstName}
// //                     />
// //                 </View>
// //                 <View style={styles.itemLayout}>
// //                     <Text style={styles.textStyle}>Last Name:</Text>
// //                     <CustomInput
// //                         placeholder={lastName}
// //                         setValue={setLastName}
// //                     />
// //                 </View>
// //                 <View style={styles.itemLayout}>
// //                     <Text style={styles.textStyle}>Email:</Text>
// //                     <CustomInput
// //                         placeholder={email}
// //                         setValue={setEmail}
// //                     />
// //                 </View>
// //                 <View style={styles.itemLayout}>
// //                     <Text style={styles.textStyle}>Phone:</Text>
// //                     <CustomInput
// //                         placeholder={phone}
// //                         setValue={setPhone}
// //                     />
// //                 </View>
// //                 <View style={styles.itemLayout}>
// //                     <Text style={styles.textStyle}>Password:</Text>
// //                     <CustomInput
// //                         placeholder={password}
// //                         setValue={setPassword}
// //                         secureTextEntry
// //                     />
// //                 </View>
// //                 <CustomButton 
// //                     text="Save Changes" 
// //                     onPress={saveDataPress} 
// //                     bgColor={'green'} 
// //                 />
// //                 <CustomButton 
// //                     text="Return" 
// //                     onPress={returnPress} 
// //                     bgColor={'red'} 
// //                 />
// //                 <CustomButton 
// //                     text="Sign Out" 
// //                     onPress={() => signOutNow(navigation)} 
// //                     bgColor={'lightgrey'} 
// //                     border-color={'black'} 
// //                 />     
// //             </View>
// //         </KeyboardAwareScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         height: '200%',
// //         paddingBottom: 70,
// //         width: "100%",
// //         display: 'flex',
// //     },
// //     headName: {
// //         alignItems: 'center',
// //         marginTop: 20,
// //     },
// //     // itemLayout: {
// //     //     flexDirection: 'column',
// //     //     alignSelf: 'flex-end',
// //     //     width: '95%',
// //     //     alignContent: 'center',
// //     // },
// //     textStyle: {
// //         fontSize: 17,
// //         paddingTop: 3,
// //         margin: 5,
// //         textAlign: 'left',
// //     },
// //     buttons: {
// //         alignSelf: 'center',
// //         alignItems: 'center',
// //         width: '85%',
// //         color: 'blue',
// //         height: 40,
// //         backgroundColor: '#fff',
// //         marginTop: 10,
// //         borderRadius: 8,
// //         display: 'flex',
// //         justifyContent: 'center',
// //     },
// //     buttonText: {
// //         color: "black",
// //         textAlign: 'center',
// //         fontWeight: "bold",
// //     },
// // });

// // export default Profile;

// // import React, { useState, useEffect } from 'react';
// // import { View, StyleSheet, Alert, ScrollView } from 'react-native';
// // import { CommonActions,useNavigation } from '@react-navigation/native';
// // import CustomInput from '../../components/CustomInput';
// // import { db, auth } from '../../../firebaseConfig';
// // import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
// // import { doc, getDoc, setDoc } from 'firebase/firestore';
// // import CustomButton from '../../components/CustomButton';




// // /////// Copy General idea from Egoz project about handling user data and updating it





// // const Profile = () => {
// //     const [email, setEmail] = useState('');
// //     const [password, setPassword] = useState('');
// //     const [firstName, setFirstName] = useState('');
// //     const [lastName, setLastName] = useState('');
// //     const [phone, setPhone] = useState('');
// //     const [initialData, setInitialData] = useState({});
// //     const navigation = useNavigation();

// //     const uID = auth.currentUser.uid;
// //     const userDoc = doc(db, "users", uID);
    
// //     useEffect(() => {
// //         const getUserData = async () => {
// //             const userDocSnap = await getDoc(userDoc);
// //             if (userDocSnap.exists()) {
// //                 const userData = userDocSnap.data();
// //                 setFirstName(userData.firstName);
// //                 setLastName(userData.lastName);
// //                 setEmail(userData.email);
// //                 setPhone(userData.phone);
// //                 setPassword(userData.password)
// //                 setInitialData(userData); // Save the initial data for change detection
// //             }
// //         };
// //         getUserData();
// //     }, []);

// //     const saveDataPress = async () => {
// //         const hasChanges = 
// //             firstName !== initialData.firstName || 
// //             lastName !== initialData.lastName || 
// //             phone !== initialData.phone || 
// //             email !== initialData.email || 
// //             password !== initialData.password;

// //         if (!hasChanges) {
// //             Alert.alert("No changes made.");
// //             return;
// //         }

// //         const userUpdates = {};
// //         if (firstName !== initialData.firstName) {
// //             userUpdates.firstName = firstName;
// //         }
// //         if (lastName !== initialData.lastName) {
// //             userUpdates.lastName = lastName;
// //         }
// //         if (phone !== initialData.phone) {
// //             userUpdates.phone = phone;
// //         }
// //         if (Object.keys(userUpdates).length > 0) {
// //             await setDoc(userDoc, userUpdates, { merge: true });
// //         }

// //         if (email !== initialData.email) {
// //             try {
// //                 await updateEmail(auth.currentUser, email);
// //                 await setDoc(userDoc, { email: email }, { merge: true });
// //             } catch (error) {
// //                 Alert.alert("Error updating email:", error.message);
// //             }
// //         }

// //         if (password) {
// //             try {
// //                 await updatePassword(auth.currentUser, password);
// //             } catch (error) {
// //                 Alert.alert("Error updating password:", error.message);
// //             }
// //         }

// //         Alert.alert("Changes saved successfully!");
// //         navigation.dispatch(CommonActions.reset({
// //             index: 0,
// //             routes: [
// //                 { name: 'homeScreen' }
// //             ],
// //         })
// //         )
// //     };

// //     const returnPress = () => {
// //         navigation.navigate('homeScreen');
// //     };

// //     const signOutPress = () => {
// //         auth.signOut();
// //     };

// //     return (
// //         <ScrollView>  
// //             <View style={styles.container}>
// //                 <CustomInput 
// //                     placeholder={firstName} 
// //                     setValue={setFirstName}
// //                 />
// //                 <CustomInput 
// //                     placeholder={lastName} 
// //                     setValue={setLastName} 
// //                 />
// //                 <CustomInput 
// //                     placeholder={email}
// //                     setValue={setEmail} 
// //                 />
// //                 <CustomInput 
// //                     placeholder={phone} 
// //                     setValue={setPhone} 
// //                 />
// //                 <CustomInput 
// //                     placeholder={password} 
// //                     setValue={setPassword} 
// //                     // secureTextEntry 
// //                 />
// //                 <CustomButton 
// //                     text="Save Changes" 
// //                     onPress={saveDataPress} 
// //                     bgColor={'green'} 
// //                 />
// //                 <CustomButton 
// //                     text="Return" 
// //                     onPress={returnPress} 
// //                     bgColor={'red'} 
// //                 />
// //                 <CustomButton 
// //                     text="Sign Out" 
// //                     onPress={signOutPress} 
// //                     bgColor={'lightgrey'} 
// //                     border-color={'black'} 
// //                 />     
// //             </View>  
// //         </ScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: '#fff',
// //         paddingTop: 30,
// //         paddingHorizontal: 10
// //     },
// //     input: {
// //         height:40,
// //         borderRadius: 12,
// //         paddingRight:10,
// //         margin:5,
// //         paddingLeft: 7,
// //         borderWidth:1,
// //         textAlign: 'right',
        

// //      },
// // });

// // export default Profile;
