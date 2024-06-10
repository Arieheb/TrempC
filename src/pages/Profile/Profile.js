import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import {db, auth} from '../../../firebaseConfig';
import { updateProfile } from "firebase/auth";
import { addDoc, collection, setDoc, getDoc } from 'firebase/firestore';
import { doc } from "firebase/firestore";
import { Alert } from 'react-native';


const Profile = () => {
    const navigation = useNavigation();

    const navigateToLogin = () => {
        navigation.navigate('loginScreen');
    };

    const navigateToHome = () => {
        navigation.navigate('homeScreen');
    };
    
    const navigateToSignUp = () => {
        navigation.navigate('signUpScreen');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ברוכים הבאים למסך הפרופיל</Text>
            <Text style={styles.subtitle}>שימוש מהנה</Text>
            <CustomInput 
                    placeholder="First Name" 
                    value={firstName} 
                    setValue={setFirstName} />
                <CustomInput 
                    placeholder="Last Name" 
                    value={lastName} 
                    setValue={setLastName} />
                
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
                    secureTextEntry
                     />
        </View>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
    },
});

export default Profile;