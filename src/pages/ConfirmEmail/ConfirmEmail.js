import React, {useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';

const ConfirmEmail = () => {
    const [code, setCode] = useState('');
    const {height} = useWindowDimensions();
    const navigation = useNavigation();



    const onConfirmedPress = () => {
        console.warn('Confirmed');
    }

    const onResendPress = () => {
        console.warn('Resend');
    }
    
    const onSignInPress = () => {
        console.warn('Sign in');
    }
    




    const navigateToLogin = () => {
        navigation.navigate('כניסה');
    };

    const navigateToProfile = () => {
        navigation.navigate('פרופיל');
    };
    
    const navigateToHome = () => {
        navigation.navigate('בית');
    };

    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Confirm Your Email</Text>
                
                <CustomInput 
                    placeholder="Enter your username"
                    value={code}
                    onChangeText={setCode}
                />


                <CustomInput 
                    placeholder="Enter your confirmation code"
                    value={code}
                    onChangeText={setCode}
                />

                <CustomButton
                    text = "Confirm"
                    onPress={onConfirmedPress}
                     />
                

                <CustomButton 
                    text = "Resend Code" 
                    onPress={onResendPress} 
                    type = "SECONDARY"

                    />
                

                <CustomButton 
                    text = "Back To Sign In" 
                    onPress={onSignInPress} 
                    type = "TERTIARY"

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
        // margin: 10,
        padding: 5,
        marginVertical: 10,
    
    },
    link: {
        color: 'blue',
    }
});

export default ConfirmEmail;