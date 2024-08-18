import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const navigation = useNavigation();
    const db = getFirestore();
    const auth = getAuth();

    const onSendPress = async () => {
        const email = username.toLowerCase().trim();
        console.log(`Checking email: '${email}'`);

        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Send password reset email
                await sendPasswordResetEmail(auth, email);
                Alert.alert('Success', 'Password reset email sent! Please check your email.');

                // Update passHasChanged in the Firestore database
                querySnapshot.forEach(async (userDoc) => {
                    const userRef = doc(db, 'users', userDoc.id);
                    await updateDoc(userRef, {
                        passHasChanged: true
                    });
                });

                // Navigate to the login screen
                navigation.navigate('loginScreen');
            } else {
                Alert.alert('Error', 'No user found with this email address.');
            }
        } catch (error) {
            console.log(`Error checking email '${email}':`, error);
            Alert.alert('Error', 'An error occurred while checking the email.');
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
                    placeholder="Enter Your Username"
                    value={username}
                    setValue={setUsername} />

                <CustomButton
                    text="Send"
                    onPress={onSendPress}
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

export default ForgotPassword;
