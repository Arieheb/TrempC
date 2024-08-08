import React, { useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, Image, ScrollView, KeyboardAvoidingView, useWindowDimensions, Alert } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { db, auth } from '../../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';

import Photo from '../../../assets/images/logo.png';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const Login = (props) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { height } = useWindowDimensions();
    const navigation = useNavigation();

    // Navigates to the Forgot Password screen
    const onForgotPasswordPress = () => {
        navigation.navigate('forgotPasswordScreen');
    }

    // Navigates to the Sign Up screen
    const signUpPress = () => {
        navigation.navigate('signUpScreen');
    }

    /**
     * Handles the sign-in process.
     * Checks if username and password are provided,
     * attempts to sign in with Firebase Authentication,
     * updates user document in Firestore if necessary,
     * and navigates to the home screen.
     */
    const handleSignIn = async () => {
        if (username === "" || password.trim() === "") {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            const user = userCredential.user;
    
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
    
            if (userDoc.exists() && userDoc.data().passHasChanged) {
                if (userDoc.data().password === password) {
                    await updateDoc(userRef, {
                        passHasChanged: false,
                    });
                } else {
                    await updatePassword(user, password);
                    await updateDoc(userRef, {
                        passHasChanged: false,
                        password: password
                    });
                }
            }
    
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'homeScreen' }],
                })
            );
        } catch (error) {
            if (username.trim() !== "") {
                Alert.alert('Error', 'Username/password are incorrect.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Error', 'Invalid email address.');
            } else {
                Alert.alert('Error', error.message);
            }
        }
    }

    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <KeyboardAvoidingView style={styles.container}>
                <Image
                    source={Photo}
                    style={[styles.logo, { height: height * 0.3 }]}
                    resizeMode="contain"
                />

                <CustomInput
                    placeholder="Username"
                    value={username}
                    setValue={setUsername}
                />

                <CustomInput
                    placeholder="Password"
                    value={password}
                    setValue={setPassword}
                    secureTextEntry
                />

                <CustomButton
                    text="Sign In"
                    onPress={handleSignIn}
                />

                <CustomButton
                    text="Forgot Password?"
                    onPress={onForgotPasswordPress}
                    type="TERTIARY"
                />

                <CustomButton
                    text="Don't have an account? Sign Up"
                    onPress={signUpPress}
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
    inputView: {
        backgroundColor: 'white',
        width: '95%',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    input: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
});

export default Login;
