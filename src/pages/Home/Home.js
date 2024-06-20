import React from 'react';
import { View, Text, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import db from '../../../firebaseConfig';
import CustomButton from '../../components/CustomButton';

const HomeScreen = () => {
    const navigation = useNavigation();

    const navigateToLogin = () => {
        navigation.navigate('loginScreen');
    };

    const navigateToProfile = () => {
        navigation.navigate('profileScreen');
    };
    
    const navigateToSignUp = () => {
        navigation.navigate('signUpScreen');
    };


    const [username, setUsername] = useState('');



    const getData = async () => { 
        const userCollection = await firestore().collection('users').get();
        console.log(userCollection.docs[0].data());
    }



    return (

        <ScrollView>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>ברוכים הבאים למסך הבית</Text>
                <Text style={styles.subtitle}>שימוש מהנה</Text>
                <TextInput placeholder="הזן מייל" />
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#888',
    },
});

export default HomeScreen;