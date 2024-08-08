import { React, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions, Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { db, auth, storage } from '../../../firebaseConfig';
import { updateProfile } from "firebase/auth";
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Asset } from 'expo-asset';
import profilePic from '../../../assets/images/profile.png';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

/**
 * Handles the sign-up process.
 * 
 * email: The user's email.
 * password: The user's password.
 * firstName: The user's first name.
 * lastName: The user's last name.
 * phone: The user's phone number.
 * returns boolean: Indicates whether the sign-up was successful.
 * 
 * 
 */
const signUpProcess = async (email, password, firstName, lastName, phone) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uID = userCredential.user.uid;

        await setDoc(doc(db, "users", uID), {
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            proPic: email.toLowerCase()
        });

        // Upload default profile picture
        const asset = Asset.fromModule(profilePic);
        await asset.downloadAsync();
        const response = await fetch(asset.localUri || asset.uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile/${email.toLowerCase()}`);
        const uploadTask = uploadBytesResumable(storageRef, blob);

        await uploadTask;

        // Send email verification
        await sendEmailVerification(userCredential.user, {
            url: 'https://trempc-ebfea.firebaseapp.com',
        });

        return true;  // Indicate that sign-up was successful
    } catch (error) {
        Alert.alert('Error', error.message);
        return false;  // Indicate that sign-up failed
    }
};

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    /**
     * Handles the sign-up button press.
     * Validates the input fields and initiates the sign-up process.
     */
    const handleSignUp = async () => {
        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        const namePattern = /^[A-Za-z]+$/;

        if (email.match(emailPattern) == null) {
            Alert.alert('Error', 'Invalid email address');
            return;
        }
        if (password !== passwordRepeat) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (!firstName.match(namePattern) || !lastName.match(namePattern)) {
            Alert.alert('Error', 'First name and last name should only contain English characters');
            return;
        }

        const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
        if (isSignUpSuccessful) {
            Alert.alert('Success', 'Verification email sent!');
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }],
            }));
        }
    };

    /**
     * Navigates to the sign-in screen.
     */
    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    };

    /**
     * Validates and sets the first name input.
     * 
     * value - The input value.
     *
     */
    const handleFirstNameChange = (value) => {
        const namePattern = /^[A-Za-z\s]*$/;
        if (value.match(namePattern) || value === '') {
            setFirstName(value);
        } else {
            Alert.alert('Error', 'First name should only contain English letters and spaces');
        }
    };

    /**
     * Validates and sets the last name input.
     * 
     * value - The input value.
     *
     */
    const handleLastNameChange = (value) => {
        const namePattern = /^[A-Za-z\s]*$/;
        if (value.match(namePattern) || value === '') {
            setLastName(value);
        } else {
            Alert.alert('Error', 'Last name should only contain English letters and spaces');
        }
    };

    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Create new account</Text>

                <CustomInput
                    placeholder="First Name"
                    value={firstName}
                    setValue={handleFirstNameChange}
                />

                <CustomInput
                    placeholder="Last Name"
                    value={lastName}
                    setValue={handleLastNameChange}
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
                    keyboardType="numeric"
                />

                <CustomInput
                    placeholder="Password"
                    value={password}
                    setValue={setPassword}
                    secureTextEntry
                />

                <CustomInput
                    placeholder="Repeat Password"
                    value={passwordRepeat}
                    setValue={setPasswordRepeat}
                    secureTextEntry
                />

                <CustomButton
                    text="Register"
                    onPress={handleSignUp}
                />

                <CustomButton
                    text="Have an account? Sign In"
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

export default SignUp;
