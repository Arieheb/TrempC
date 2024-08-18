import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth, updatePassword } from 'firebase/auth';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const NewPassword = () => {
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmCode, setConfirmCode] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;
    const db = getFirestore();
    const auth = getAuth();

    const onSubmitPress = async () => {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                if (userData.confirmationCode === confirmCode) {
                    // Update the password in Firebase Authentication
                    const user = await auth.getUserByEmail(email);
                    await updatePassword(user, newPassword);

                    // Update the password in Firestore
                    await updateDoc(doc(db, 'users', userDoc.id), { password: newPassword });

                    Alert.alert('Success', 'Password has been reset. Please sign in with your new password.');
                    navigation.navigate('loginScreen');
                } else {
                    Alert.alert('Error', 'Confirmation code does not match.');
                }
            } else {
                Alert.alert('Error', 'No user found with this email address.');
            }
        } catch (error) {
            console.log('Error resetting password:', error);
            Alert.alert('Error', 'An error occurred while resetting the password.');
        }
    };

    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    };

    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Reset Your Password</Text>
                
                <CustomInput
                    placeholder="Enter Confirmation Code"
                    value={confirmCode}
                    setValue={setConfirmCode} />

                <CustomInput 
                    placeholder="Enter New Password" 
                    value={newPassword} 
                    setValue={setNewPassword}
                    secureTextEntry
                />
            
                <CustomInput 
                    placeholder="Confirm new password" 
                    value={code} 
                    setValue={setCode}
                    secureTextEntry
                />

                <CustomButton
                    text="Submit"
                    onPress={onSubmitPress}
                />

                <CustomButton 
                    text="Back To Sign In" 
                    onPress={onSignInPress} 
                    type="TERTIARY"
                />
                
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
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        margin: 15,
        padding: 15,
    },
    text: {
        color: "gray",
        padding: 5,
        marginVertical: 10,
    },
    link: {
        color: 'blue',
    }
});

export default NewPassword;

// import React, {useState, useEffect} from 'react';
// import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';

// const NewPassword = () => {
//     const [code, setCode] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmCode, setConfirmCode] = useState('');
//     const {height} = useWindowDimensions();
//     const navigation = useNavigation();



//     const navigateToLogin = () => {
//         navigation.navigate('loginScreen');
//     };

    
//     const navigateToHome = () => {
//         navigation.navigate('homeScreen');
//     };

//     return (
//         <ScrollView style={{backgroundColor: 'white'}}>
//             <KeyboardAvoidingView style={styles.container}>
//                 <Text style={styles.title}>Reset Your Password</Text>
                
//                 <CustomInput
//                     placeholder="Enter Confirmation Code"
//                     value={confirmCode}
//                     setValue={setConfirmCode} />

//                 <CustomInput 
//                     placeholder="Enter New Password" 
//                     value={newPassword} 
//                     setValue={setNewPassword}
//                     secureTextEntry
//                      />
            
//                 <CustomInput 
//                     placeholder="Confirm new password" 
//                     value={code} 
//                     setValue={setCode}
//                     />

//                 <CustomButton
//                     text = "Submit"
//                     onPress={navigateToHome}
//                      />

//                 <CustomButton 
//                     text = "Back To Sign In" 
//                     onPress={navigateToLogin} 
//                     type = "TERTIARY"

//                     />
                
//             </KeyboardAvoidingView>
//         </ScrollView>
//     );
// };


// // lets start fresh. the last update of the forgot password is working (checking and comparing that the emails match). upon success, send the user an email with a confirmation code. 
// // in the newPassword screen, the user will insert the confirmation code into a confirmation field, and then create the new password. 

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 30,
//         fontWeight: 'bold',
//         margin: 15,
//         padding: 15,
//     },
//     text: {
//         color: "gray",
//         // margin: 10,
//         padding: 5,
//         marginVertical: 10,
    
//     },
//     link: {
//         color: 'blue',
//     }
// });

// export default NewPassword;