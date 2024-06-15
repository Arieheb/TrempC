import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { CommonActions,useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import { db, auth } from '../../../firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import CustomButton from '../../components/CustomButton';

const Profile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialData, setInitialData] = useState({});
    const navigation = useNavigation();

    const uID = auth.currentUser.uid;
    const userDoc = doc(db, "users", uID);
    
    useEffect(() => {
        const getUserData = async () => {
            const userDocSnap = await getDoc(userDoc);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setFirstName(userData.firstName);
                setLastName(userData.lastName);
                setEmail(userData.email);
                setPhone(userData.phone);
                setPassword(userData.password)
                setInitialData(userData); // Save the initial data for change detection
            }
        };
        getUserData();
    }, []);

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

        if (password) {
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
        })
        )
    };

    const returnPress = () => {
        navigation.navigate('homeScreen');
    };

    const signOutPress = () => {
        auth.signOut();
    };

    return (
        <ScrollView>  
            <View style={styles.container}>
                <CustomInput 
                    placeholder="First Name" 
                    value={firstName} 
                    setValue={setFirstName} 
                />
                <CustomInput 
                    placeholder="Last Name" 
                    value={lastName} 
                    setValue={setLastName} 
                />
                <CustomInput 
                    placeholder="Email" 
                    value={email} 
                    setValue={setEmail} 
                />
                <CustomInput 
                    placeholder="Phone Number" 
                    value={phone} 
                    setValue={setPhone} 
                />
                <CustomInput 
                    placeholder="Password" 
                    value={password} 
                    setValue={setPassword} 
                    // secureTextEntry 
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
                    onPress={signOutPress} 
                    bgColor={'lightgrey'} 
                    border-color={'black'} 
                />     
            </View>  
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: 30,
        paddingHorizontal: 10
    },
});

export default Profile;

// import React from 'react';
// import { View, Text, StyleSheet, Button } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import CustomInput from '../../components/CustomInput';
// import {db, auth} from '../../../firebaseConfig';
// import { updateProfile } from "firebase/auth";
// import { addDoc, collection, setDoc, getDoc } from 'firebase/firestore';
// import { doc } from "firebase/firestore";
// import { Alert } from 'react-native';
// import { useState } from 'react';
// import CustomButton from '../../components/CustomButton';
// import { ScrollView } from 'react-native-gesture-handler';


// const Profile = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [firstName, setFirstName] =useState("")
//     const [lastName, setLastName] =useState("")
//     const [phone, setPhone] =useState("")
//     const navigation = useNavigation();

//     const uID = auth.currentUser.uid;
//     const userDoc = doc(db, "users", uID);
    
//     const getUserData = async () => {
//         const userDocSnap = await getDoc(userDoc);
//         const userData = userDocSnap.data();
//         console.log(userData);
//     }


//     const saveDataPress = async () => {
//         console.log("saveData");
        
//         // navigation.navigate('homeScreen');
//     }
//     const returnPress = () => {
//         console.log("return");
//         navigation.navigate('homeScreen');
//     };
//     const signOutPress = () => {
//         console.log("signOut");
//         auth.signOut();
//     };


//     return (
//         <ScrollView>  
//         <View style={styles.container}>
            
//             <CustomInput 
//                 placeholder="First Name" 
//                 value={firstName} 
//                 setValue={setFirstName} />
            
//             <CustomInput 
//                 placeholder="Last Name" 
//                 value={lastName} 
//                 setValue={setLastName} />
            
//             <CustomInput 
//                 placeholder="Email" 
//                 value={email} 
//                 setValue={setEmail}
//                     />

//             <CustomInput 
//                 placeholder="Phone Number" 
//                 value={phone} 
//                 setValue={setPhone}
//                     />
            
//             {/* <CustomInput 
//                 placeholder="Password" 
//                 value={password} 
//                 setValue={setPassword}
//                 secureTextEntry
//                     /> */}
//             <CustomButton 
//                 text = "return" 
//                 onPress={getUserData}
//                 bgColor={'red'}

//                     />       

//             <CustomButton 
//                 text={"Save Changes"}
//                 onPress={saveDataPress}
//                 bgColor={'green'}
//                 // type = "PRIMARY"
//                     />
                  
//             <CustomButton 
//                 text = "Sign Out" 
//                 onPress={signOutPress}
//                 bgColor={'lightgrey'}
//                 border-color={'black'}
//             />     

//         </View>  
//         </ScrollView>
        
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//         paddingTop: 30,
//         paddingHorizontal: 10
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 16,
//     },
//     subtitle: {
//         fontSize: 18,
//         color: '#888',
//     },
// });

// export default Profile;