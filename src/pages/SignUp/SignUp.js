import {React, useState, useEffect} from 'react';
import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import AppIntroSlider from 'react-native-app-intro-slider';
import {db, auth} from '../../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';




import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const {height} = useWindowDimensions();
    const navigation = useNavigation();





// const validateInfo = () => {
//     if (username === '' || Email === '' || password === '' || passwordRepeat === '') {
//         alert('Please fill in all fields');
//         return false;
//     }
//     if (password !== passwordRepeat) {
//         alert('Passwords do not match');
//         return false;
//     }
//     return true;
// };

    const auth = getAuth();
    const createUser = () => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          navigation.navigate('confirmScreen');
          onChangeLoggedInUser(user.email);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    };


    // const onRegisterPress = () => {
    //     navigation.navigate('homeScreen');
    // }
    const onTermsOfUsePress = () => {
        console.warn('Terms of Use');
    }
    const onPrivacyPress = () => {
        console.warn('Privacy policy');
    }

    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    }




    return (
        <ScrollView style={{backgroundColor: 'white'}}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Create new account</Text>
                
                <CustomInput 
                    placeholder="Username" 
                    value={username} 
                    setValue={setUsername} />
                
                <CustomInput 
                    placeholder="Email" 
                    value={email} 
                    setValue={setEmail}
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
                    text = "Register" 
                    onPress={createUser}                    
                    />

                <Text style={styles.text}>By registering, you confirm that you accept our {''}
                    <Text style={styles.link} onPress={onTermsOfUsePress}>Terms of Use</Text> and {''}
                    <Text style={styles.link} onPress={onPrivacyPress}>Privacy policy</Text>
                </Text>
                
                <SocialSignInButtons />
                

                <CustomButton 
                    text = "Have an account? Sign In" 
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

export default SignUp;