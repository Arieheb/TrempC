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

const signUpProcess = async (email, password, firstName, lastName, phone) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uID = userCredential.user.uid;
        console.log(uID);

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

    const handleSignUp = async () => {
        const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (email.match(pattern) == null) {
            Alert.alert('Error', 'Invalid email address');
            return;
        }
        if (password !== passwordRepeat) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
        if (isSignUpSuccessful) {
            Alert.alert('Success', 'Verification email sent!');
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'homeScreen' }
                ],
            }));
        }
    };

    const onSignInPress = () => {
        navigation.navigate('loginScreen');
    };

    return (
        <ScrollView style={{ backgroundColor: 'white' }}>
            <KeyboardAvoidingView style={styles.container}>
                <Text style={styles.title}>Create new account</Text>

                <CustomInput
                    placeholder="First Name"
                    value={firstName}
                    setValue={setFirstName}
                />

                <CustomInput
                    placeholder="Last Name"
                    value={lastName}
                    setValue={setLastName}
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

// import {React, useState} from 'react';
// import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
// import { CommonActions, useNavigation } from '@react-navigation/native';
// import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import { db, auth, storage } from '../../../firebaseConfig';
// import { updateProfile } from "firebase/auth";
// import { setDoc } from 'firebase/firestore';
// import { doc } from "firebase/firestore";
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { Alert } from 'react-native';
// import { Asset } from 'expo-asset'; // Import Asset from expo-asset
// import profilePic from '../../../assets/images/profile.png';

// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';

// const signUpProcess = async (email, password, firstName, lastName, phone) => {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const uID = userCredential.user.uid;
//         console.log(uID);

//         await setDoc(doc(db, "users", uID), {
//             email: email,
//             password: password,
//             firstName: firstName,
//             lastName: lastName,
//             phone: phone,
//             proPic: email.toLowerCase()
//         });

//         await sendEmailVerification(userCredential.user, {
//             url: 'https://trempc-ebfea.firebaseapp.com',
//         });

//         // Upload default profile picture
//         const asset = Asset.fromModule(profilePic);
//         await asset.downloadAsync();
//         const response = await fetch(asset.localUri || asset.uri);
//         const blob = await response.blob();
//         const storageRef = ref(storage, `profile/${email.toLowerCase()}`);
//         const uploadTask = uploadBytesResumable(storageRef, blob);

//         await uploadTask;

//         Alert.alert('Success', 'Verification email sent!');
//         return true;  // Indicate that sign-up was successful
//     } catch (error) {
//         Alert.alert('Error', error.message);
//         return false;  // Indicate that sign-up failed
//     }
// };

// const SignUp = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [passwordRepeat, setPasswordRepeat] = useState('');
//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [phone, setPhone] = useState('');

//     const { height } = useWindowDimensions();
//     const navigation = useNavigation();

//     const handleSignUp = async () => {
//         const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
//         if (email.match(pattern) == null) {
//             Alert.alert('Error', 'Invalid email address');
//             return;
//         }
//         if (password !== passwordRepeat) {
//             Alert.alert('Error', 'Passwords do not match');
//             return;
//         }
//         const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
//         if (isSignUpSuccessful) {
//             navigation.dispatch(CommonActions.reset({
//                 index: 0,
//                 routes: [
//                     { name: 'homeScreen' }
//                 ],
//             }));
//         }
//     };

//     const onSignInPress = () => {
//         navigation.navigate('loginScreen');
//     };

//     return (
//         <ScrollView style={{ backgroundColor: 'white' }}>
//             <KeyboardAvoidingView style={styles.container}>
//                 <Text style={styles.title}>Create new account</Text>

//                 <CustomInput
//                     placeholder="First Name"
//                     value={firstName}
//                     setValue={setFirstName}
//                 />

//                 <CustomInput
//                     placeholder="Last Name"
//                     value={lastName}
//                     setValue={setLastName}
//                 />

//                 <CustomInput
//                     placeholder="Email"
//                     value={email}
//                     setValue={setEmail}
//                 />

//                 <CustomInput
//                     placeholder="Phone Number"
//                     value={phone}
//                     setValue={setPhone}
//                 />

//                 <CustomInput
//                     placeholder="Password"
//                     value={password}
//                     setValue={setPassword}
//                     secureTextEntry
//                 />

//                 <CustomInput
//                     placeholder="Repeat Password"
//                     value={passwordRepeat}
//                     setValue={setPasswordRepeat}
//                     secureTextEntry
//                 />

//                 <CustomButton
//                     text="Register"
//                     onPress={handleSignUp}
//                 />

//                 <CustomButton
//                     text="Have an account? Sign In"
//                     onPress={onSignInPress}
//                     type="TERTIARY"
//                 />

//             </KeyboardAvoidingView>
//         </ScrollView>
//     );
// };

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
//         padding: 5,
//         marginVertical: 10,
//     },
//     link: {
//         color: 'blue',
//     }
// });

// export default SignUp;

// // import {React, useState} from 'react';
// // import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
// // import { CommonActions, useNavigation } from '@react-navigation/native';
// // import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// // import { db, auth, storage } from '../../../firebaseConfig';
// // import { updateProfile } from "firebase/auth";
// // import { setDoc } from 'firebase/firestore';
// // import { doc } from "firebase/firestore";
// // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // import { Alert } from 'react-native';
// // import profilePic from '../../../assets/images/profile.png';

// // import CustomInput from '../../components/CustomInput';
// // import CustomButton from '../../components/CustomButton';

// // const signUpProcess = async (email, password, firstName, lastName, phone) => {
// //     try {
// //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// //         const uID = userCredential.user.uid;
// //         console.log(uID);

// //         await setDoc(doc(db, "users", uID), {
// //             email: email,
// //             password: password,
// //             firstName: firstName,
// //             lastName: lastName,
// //             phone: phone,
// //             proPic: email.toLowerCase()
// //         });

// //         await sendEmailVerification(userCredential.user, {
// //             url: 'https://trempc-ebfea.firebaseapp.com',
// //         });

// //         // Upload default profile picture
// //         const response = await fetch(profilePic);
// //         const blob = await response.blob();
// //         const storageRef = ref(storage, `profile/${email.toLowerCase()}`);
// //         const uploadTask = uploadBytesResumable(storageRef, blob);

// //         await uploadTask;

// //         Alert.alert('Success', 'Verification email sent!');
// //         return true;  // Indicate that sign-up was successful
// //     } catch (error) {
// //         Alert.alert('Error', error.message);
// //         return false;  // Indicate that sign-up failed
// //     }
// // };

// // const SignUp = () => {
// //     const [email, setEmail] = useState('');
// //     const [password, setPassword] = useState('');
// //     const [passwordRepeat, setPasswordRepeat] = useState('');
// //     const [firstName, setFirstName] = useState('');
// //     const [lastName, setLastName] = useState('');
// //     const [phone, setPhone] = useState('');

// //     const { height } = useWindowDimensions();
// //     const navigation = useNavigation();

// //     const handleSignUp = async () => {
// //         const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
// //         if (email.match(pattern) == null) {
// //             Alert.alert('Error', 'Invalid email address');
// //             return;
// //         }
// //         if (password !== passwordRepeat) {
// //             Alert.alert('Error', 'Passwords do not match');
// //             return;
// //         }
// //         const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
// //         if (isSignUpSuccessful) {
// //             navigation.dispatch(CommonActions.reset({
// //                 index: 0,
// //                 routes: [
// //                     { name: 'homeScreen' }
// //                 ],
// //             }));
// //         }
// //     };

// //     const onSignInPress = () => {
// //         navigation.navigate('loginScreen');
// //     };

// //     return (
// //         <ScrollView style={{ backgroundColor: 'white' }}>
// //             <KeyboardAvoidingView style={styles.container}>
// //                 <Text style={styles.title}>Create new account</Text>

// //                 <CustomInput
// //                     placeholder="First Name"
// //                     value={firstName}
// //                     setValue={setFirstName}
// //                 />

// //                 <CustomInput
// //                     placeholder="Last Name"
// //                     value={lastName}
// //                     setValue={setLastName}
// //                 />

// //                 <CustomInput
// //                     placeholder="Email"
// //                     value={email}
// //                     setValue={setEmail}
// //                 />

// //                 <CustomInput
// //                     placeholder="Phone Number"
// //                     value={phone}
// //                     setValue={setPhone}
// //                 />

// //                 <CustomInput
// //                     placeholder="Password"
// //                     value={password}
// //                     setValue={setPassword}
// //                     secureTextEntry
// //                 />

// //                 <CustomInput
// //                     placeholder="Repeat Password"
// //                     value={passwordRepeat}
// //                     setValue={setPasswordRepeat}
// //                     secureTextEntry
// //                 />

// //                 <CustomButton
// //                     text="Register"
// //                     onPress={handleSignUp}
// //                 />

// //                 <CustomButton
// //                     text="Have an account? Sign In"
// //                     onPress={onSignInPress}
// //                     type="TERTIARY"
// //                 />

// //             </KeyboardAvoidingView>
// //         </ScrollView>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: '#fff',
// //     },
// //     title: {
// //         fontSize: 30,
// //         fontWeight: 'bold',
// //         margin: 15,
// //         padding: 15,
// //     },
// //     text: {
// //         color: "gray",
// //         padding: 5,
// //         marginVertical: 10,
// //     },
// //     link: {
// //         color: 'blue',
// //     }
// // });

// // export default SignUp;

// // // import {React, useState, useEffect} from 'react';
// // // import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
// // // import { CommonActions, useNavigation } from '@react-navigation/native';
// // // import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// // // import {db, auth} from '../../../firebaseConfig';
// // // import { updateProfile } from "firebase/auth";
// // // import { addDoc, collection, setDoc } from 'firebase/firestore';
// // // import { doc } from "firebase/firestore";
// // // import { Alert } from 'react-native';
// // // import profilePic from '../../../assets/images/profile.png';

// // // import CustomInput from '../../components/CustomInput';
// // // import CustomButton from '../../components/CustomButton';
// // // uID ="";

// // // ///////////////////////// Sign Up Process //////////////////////////

// // // const signUpProcess = async (email, password, firstName, lastName, phone) => {
// // //     try {
// // //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// // //         const uID = userCredential.user.uid;
// // //         console.log(uID);

// // //         await setDoc(doc(db, "users", uID), {
// // //             email: email,
// // //             password: password,
// // //             firstName: firstName,
// // //             lastName: lastName,
// // //             phone: phone,
// // //             proPic: email
// // //         });

// // //         await sendEmailVerification(userCredential.user, {
// // //             url: 'https://trempc-ebfea.firebaseapp.com',
// // //         });
        
// // //         Alert.alert('Success', 'Verification email sent!');
// // //         return true;  // Indicate that sign-up was successful
// // //     } catch (error) {
// // //         Alert.alert('Error', error.message);
// // //         return false;  // Indicate that sign-up failed
// // //     }
// // // };

// // // ///////////////////////// signUp.js action //////////////////////////

// // // const SignUp = () => {
// // //     const [email, setEmail] = useState('');
// // //     const [password, setPassword] = useState('');
// // //     const [passwordRepeat, setPasswordRepeat] = useState('');
// // //     const [firstName, setFirstName] =useState("");
// // //     const [lastName, setLastName] =useState("");
// // //     const [phone, setPhone] =useState("");

// // //     const {height} = useWindowDimensions();
// // //     const navigation = useNavigation();

// // //     const handleSignUp = async () => {
// // //         pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
// // //         if (email.match(pattern) == null) {
// // //             Alert.alert('Error', 'Invalid email address');
// // //             return;
// // //         }
// // //         if (password !== passwordRepeat) {
// // //             Alert.alert('Error', 'Passwords do not match');
// // //             return;
// // //         }
// // //         const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
// // //         if (isSignUpSuccessful) {
// // //             navigation.dispatch(CommonActions.reset({
// // //                 index: 0,
// // //                 routes: [
// // //                     { name: 'homeScreen' }
// // //                 ],
// // //             }));
// // //         }
// // //     };

// // //     const onSignInPress = () => {
// // //         navigation.navigate('loginScreen');
// // //     };

// // //     return (
// // //         <ScrollView style={{backgroundColor: 'white'}}>
// // //             <KeyboardAvoidingView style={styles.container}>
// // //                 <Text style={styles.title}>Create new account</Text>
                
// // //                 <CustomInput 
// // //                     placeholder="First Name" 
// // //                     value={firstName} 
// // //                     setValue={setFirstName} />
                    
// // //                 <CustomInput 
// // //                     placeholder="Last Name" 
// // //                     value={lastName} 
// // //                     setValue={setLastName} />
                
// // //                 <CustomInput 
// // //                     placeholder="Email" 
// // //                     value={email} 
// // //                     setValue={setEmail}
// // //                      />

// // //                 <CustomInput 
// // //                     placeholder="Phone Number" 
// // //                     value={phone} 
// // //                     setValue={setPhone}
// // //                      />
                
// // //                 <CustomInput 
// // //                     placeholder="Password" 
// // //                     value={password} 
// // //                     setValue={setPassword}
// // //                     secureTextEntry
// // //                      />

// // //                 <CustomInput 
// // //                     placeholder="Repeat Password" 
// // //                     value={passwordRepeat} 
// // //                     setValue={setPasswordRepeat}
// // //                     secureTextEntry
// // //                      />

// // //                 <CustomButton 
// // //                     text = "Register" 
// // //                     onPress={handleSignUp}                    
// // //                     />                            

// // //                 <CustomButton 
// // //                     text = "Have an account? Sign In" 
// // //                     onPress={onSignInPress} 
// // //                     type = "TERTIARY"
// // //                     />

// // //             </KeyboardAvoidingView>
// // //         </ScrollView>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         backgroundColor: '#fff',
// // //     },
// // //     title: {
// // //         fontSize: 30,
// // //         fontWeight: 'bold',
// // //         margin: 15,
// // //         padding: 15,
// // //     },
// // //     text: {
// // //         color: "gray",
// // //         padding: 5,
// // //         marginVertical: 10,
    
// // //     },
// // //     link: {
// // //         color: 'blue',
// // //     }
// // // });

// // // export default SignUp;

// // // // import {React, useState, useEffect} from 'react';
// // // // import { View, Text, SafeAreaView, StyleSheet, Button, TextInput, ScrollView, KeyboardAvoidingView, useWindowDimensions } from 'react-native';
// // // // import { CommonActions, useNavigation } from '@react-navigation/native';
// // // // import { getAuth, createUserWithEmailAndPassword, sendSignInLinkToEmail } from "firebase/auth";
// // // // import {db, auth} from '../../../firebaseConfig';
// // // // import { updateProfile } from "firebase/auth";
// // // // import { addDoc, collection, setDoc } from 'firebase/firestore';
// // // // import { doc } from "firebase/firestore";
// // // // import { Alert } from 'react-native';


// // // // import CustomInput from '../../components/CustomInput';
// // // // import CustomButton from '../../components/CustomButton';
// // // // uID ="";

// // // // ///////////////////////// Sign Up Process //////////////////////////

// // // // const signUpProcess = async (email, password, firstName, lastName, phone) => {
// // // //     try {
// // // //         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
// // // //         const uID = userCredential.user.uid;
// // // //         console.log(uID);

// // // //         await setDoc(doc(db, "users", uID), {
// // // //             email: email,
// // // //             password: password,
// // // //             firstName: firstName,
// // // //             lastName: lastName,
// // // //             phone: phone,
// // // //             proPic: email
// // // //         });
        
// // // //         Alert.alert('Success', 'User registered successfully!');
// // // //         return true;  // Indicate that sign-up was successful
// // // //     } catch (error) {
// // // //         Alert.alert('Error', error.message);
// // // //         return false;  // Indicate that sign-up failed
// // // //     }
// // // // };
    

// // // // ///////////////////////// signUp.js action //////////////////////////



// // // // const SignUp = () => {
// // // //     const [email, setEmail] = useState('');
// // // //     const [password, setPassword] = useState('');
// // // //     const [passwordRepeat, setPasswordRepeat] = useState('');
// // // //     const [firstName, setFirstName] =useState("")
// // // //     const [lastName, setLastName] =useState("")
// // // //     const [phone, setPhone] =useState("")

// // // //     const {height} = useWindowDimensions();
// // // //     const navigation = useNavigation();


// // // //     const handleSignUp = async () => {
// // // //         pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
// // // //         if (email.match(pattern) == null) {
// // // //             Alert.alert('Error', 'Invalid email address');
// // // //             return;
// // // //         }
// // // //         else {
// // // //             const isSignUpSuccessful = await signUpProcess(email, password, firstName, lastName, phone);
// // // //         if (isSignUpSuccessful) {
// // // //             navigation.dispatch(CommonActions.reset({
// // // //                 index: 0,
// // // //                 routes: [
// // // //                     { name: 'homeScreen' }
// // // //                 ],
// // // //             }));
// // // //         }
// // // //         }
        
// // // //     };
    
// // // //     const onSignInPress = () => {
// // // //         navigation.navigate('loginScreen');
// // // //     }

// // // //     return (
// // // //         <ScrollView style={{backgroundColor: 'white'}}>
// // // //             <KeyboardAvoidingView style={styles.container}>
// // // //                 <Text style={styles.title}>Create new account</Text>
                
// // // //                 <CustomInput 
// // // //                     placeholder="First Name" 
// // // //                     value={firstName} 
// // // //                     setValue={setFirstName} />
                    
// // // //                 <CustomInput 
// // // //                     placeholder="Last Name" 
// // // //                     value={lastName} 
// // // //                     setValue={setLastName} />
                
// // // //                 <CustomInput 
// // // //                     placeholder="Email" 
// // // //                     value={email} 
// // // //                     setValue={setEmail}
// // // //                      />

// // // //                 <CustomInput 
// // // //                     placeholder="Phone Number" 
// // // //                     value={phone} 
// // // //                     setValue={setPhone}
// // // //                      />
                
// // // //                 <CustomInput 
// // // //                     placeholder="Password" 
// // // //                     value={password} 
// // // //                     setValue={setPassword}
// // // //                     secureTextEntry
// // // //                      />

// // // //                 <CustomInput 
// // // //                     placeholder="Repeat Password" 
// // // //                     value={passwordRepeat} 
// // // //                     setValue={setPasswordRepeat}
// // // //                     secureTextEntry
// // // //                      />

// // // //                 <CustomButton 
// // // //                     text = "Register" 
// // // //                     onPress={handleSignUp}                    
// // // //                     />                            

// // // //                 <CustomButton 
// // // //                     text = "Have an account? Sign In" 
// // // //                     onPress={onSignInPress} 
// // // //                     type = "TERTIARY"
// // // //                     />

// // // //             </KeyboardAvoidingView>
// // // //         </ScrollView>
// // // //     );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //     container: {
// // // //         flex: 1,
// // // //         justifyContent: 'center',
// // // //         alignItems: 'center',
// // // //         backgroundColor: '#fff',
// // // //     },
// // // //     title: {
// // // //         fontSize: 30,
// // // //         fontWeight: 'bold',
// // // //         margin: 15,
// // // //         padding: 15,
// // // //     },
// // // //     text: {
// // // //         color: "gray",
// // // //         // margin: 10,
// // // //         padding: 5,
// // // //         marginVertical: 10,
    
// // // //     },
// // // //     link: {
// // // //         color: 'blue',
// // // //     }
// // // // });

// // // // export default SignUp;