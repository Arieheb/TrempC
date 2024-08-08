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

    /**
     * Handles the submission of the new password.
     * Checks if the confirmation code matches, updates the password in Firebase Authentication and Firestore.
     */
    const onSubmitPress = async () => {
        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                if (userData.confirmationCode === confirmCode) {
                    const user = await auth.getUserByEmail(email);
                    await updatePassword(user, newPassword);

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

    /**
     * Navigates back to the sign-in screen.
     */
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
