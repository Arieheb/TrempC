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
    const hasFetchedData = useRef(false);
    const { showActionSheetWithOptions } = useActionSheet();

    const userDoc = doc(db, "users", auth.currentUser.uid);
    const user = auth.currentUser;
    useEffect(() => {
        if (user && !hasFetchedData.current) {
            const uID = user.uid;
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
                        hasFetchedData.current = true;
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
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'homeScreen' }
            ],
        }));
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
        <ScrollView>
            <View style={styles.container}>
                <UploadPhoto 
                    storagePath="profile"
                    imageName={email} 
                    defaultImage={Profile}
                />
                
                <CustomInput 
                    placeholder={firstName} 
                    setValue={setFirstName} 
                />
                
                <CustomInput 
                    placeholder={lastName} 
                    setValue={setLastName} 
                />
                
                <CustomInput 
                    placeholder={phone} 
                    setValue={setPhone} 
                />
                
                <CustomInput 
                    placeholder="Password" 
                    secureTextEntry={true} 
                    setValue={setPassword} 
                />
                
                <CustomButton 
                    text="Save Changes" 
                    onPress={saveDataPress} 
                    bgColor={'green'} 
                />
                
                <CustomButton 
                    text="Return" 
                    onPress={returnPress} 
                    bgColor={'red'} 
                />
                
                <CustomButton 
                    text="Sign Out" 
                    onPress={() => signOutNow(navigation)} 
                    bgColor={'lightgrey'} 
                    fgColor={'black'} 
                />
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


// import React, { useState, useEffect, useRef } from 'react';
// import { View, StyleSheet, Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
// import { CommonActions, useNavigation } from '@react-navigation/native';
// import { db, auth } from '../../../firebaseConfig';
// import { updateEmail, updatePassword } from "firebase/auth";
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';
// import { useActionSheet } from '@expo/react-native-action-sheet';
// import UploadPhoto from '../../components/UploadImage/UploadImage';


// const signOutNow = (navigation) => {
//     auth.signOut().then(() => {
//         navigation.dispatch(CommonActions.reset({
//             index: 0,
//             routes: [
//                 { name: 'loginScreen' }
//             ],
//         })
//         )
//     }).catch((error) => {
//         Alert.alert("Error signing out:", error.message);
//     });
// }

// const Profile = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [initialData, setInitialData] = useState({});
//     const [image, setImage] = useState(null);
//     const navigation = useNavigation();
//     const hasFetchedData = useRef(false); // Use ref to control fetching
//     const { showActionSheetWithOptions } = useActionSheet(); // Use action sheet hook

//     const userDoc = doc(db, "users", auth.currentUser.uid);
//     const user = auth.currentUser;
//     useEffect(() => {
//         if (user && !hasFetchedData.current) {
//             const uID = user.uid;
//             const getUserData = async () => {
//                 try {
//                     const userDocSnap = await getDoc(userDoc);
//                     if (userDocSnap.exists()) {
//                         const userData = userDocSnap.data();
//                         setFirstName(userData.firstName);
//                         setLastName(userData.lastName);
//                         setEmail(userData.email);
//                         setPhone(userData.phone);
//                         setPassword(userData.password);
//                         setInitialData(userData);
//                         hasFetchedData.current = true; // Set ref to true after fetching
//                     }
//                 } catch (error) {
//                     Alert.alert("Error fetching user data:", error.message);
//                 }
//             };
//             getUserData();
//         }
//     }, [user]);

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

//         if (password && password !== initialData.password) {
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
//         navigation.dispatch(CommonActions.reset({
//             index: 0,
//             routes: [
//                 { name: 'homeScreen' }
//             ],
//         }));
//     };

//     const showActionSheet = () => {
//         const options = ['Upload from Gallery', 'Take a Picture', 'Cancel'];
//         const cancelButtonIndex = 2;
//     };

//     return (
//         <ScrollView>
//             <View style={styles.container}>
//                 <UploadPhoto 
//                     storagePath="profile"
//                     user={email} 
//                     image={image} 
//                     onPress={showActionSheet} 
//                 />
                
//                 <CustomInput 
//                     placeholder={firstName} 
//                     setValue={setFirstName} 
//                 />
                
//                 <CustomInput 
//                     placeholder={lastName} 
//                     setValue={setLastName} 
//                 />
                
//                 <CustomInput 
//                     placeholder={phone} 
//                     setValue={setPhone} 
//                 />
                
//                 <CustomInput 
//                     placeholder="Password" 
//                     secureTextEntry={true} 
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
// }

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
