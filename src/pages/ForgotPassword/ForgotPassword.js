import React, {useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const {height} = useWindowDimensions();
    const navigation = useNavigation();



    const onSendPress = () => {
        navigation.navigate('newPasswordScreen');
    }
    
    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    }
    
    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Reset Your Password</Text>
                
                <CustomInput 
                    placeholder="Enter Your Username" 
                    value={username} 
                    setValue={setUsername} />

                <CustomButton
                    text = "Send"
                    onPress={onSendPress}
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

export default ForgotPassword;