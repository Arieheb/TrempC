import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { db, auth, storage } from '../../../firebaseConfig';
import { updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { useActionSheet } from '@expo/react-native-action-sheet';
import UploadPhoto from '../../components/UploadImage/UploadImage';
import ProfileImage from '../../../assets/images/profile.png'; // Import the local image
import { useUser } from '../../../UserContext'; // Import the user context

const Profile = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [initialData, setInitialData] = useState({});
    const [image, setImage] = useState(ProfileImage); // Use local image as default
    const [tempImageUri, setTempImageUri] = useState(null);
    const navigation = useNavigation();
    const hasFetchedData = useRef(false);
    const { showActionSheetWithOptions } = useActionSheet();
    const { userProfile, setUserProfile } = useUser(); // Use the user context

    const userDoc = doc(db, "users", auth.currentUser.uid);
    const user = auth.currentUser;

    useEffect(() => {
        if (user && !hasFetchedData.current) {
            const uID = user.uid;
            const getUserData = async () => {
                try {
                    const userDocSnap = await getDoc(userDoc);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setInitialData(userData);
                        setFirstName(userData.firstName || '');
                        setLastName(userData.lastName || '');
                        setEmail(userData.email || '');
                        setPhone(userData.phone || '');
                        hasFetchedData.current = true;
                    }
                } catch (error) {
                    Alert.alert("Error fetching user data:", error.message);
                }
            };
            getUserData();
        }
    }, [user]);

    const saveDataPress = async () => {
        const namePattern = /^[A-Za-z]+$/;

        if (!firstName.match(namePattern)) {
            Alert.alert('Error', 'First name should only contain English characters');
            return;
        }

        if (!lastName.match(namePattern)) {
            Alert.alert('Error', 'Last name should only contain English characters');
            return;
        }

        if (!tempImageUri &&
            email === initialData.email &&
            firstName === initialData.firstName &&
            lastName === initialData.lastName &&
            phone === initialData.phone &&
            !password.trim()) {
            Alert.alert('No changes to be saved.');
            return;
        }

        const userUpdates = {
            firstName: firstName || initialData.firstName,
            lastName: lastName || initialData.lastName,
            phone: phone || initialData.phone,
        };

        if (email !== initialData.email) {
            userUpdates.email = email;
        }

        if (Object.keys(userUpdates).length > 0) {
            await setDoc(userDoc, userUpdates, { merge: true });
        }

        if (password.trim()) {
            try {
                await updatePassword(auth.currentUser, password);
            } catch (error) {
                Alert.alert("Error updating password:", error.message);
            }
        }

        if (tempImageUri) {
            await uploadProfileImage(tempImageUri);
        }

        // Update the context with the new profile information
        setUserProfile((prevState) => ({
            ...prevState,
            fullName: `${userUpdates.firstName} ${userUpdates.lastName}`,
        }));

        Alert.alert("Changes saved successfully!");
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'homeScreen' }
            ],
        }));
    };

    const uploadProfileImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profile/${email.toLowerCase()}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            await uploadTask;

            const url = await getDownloadURL(storageRef);
            setImage({ uri: url });
            setUserProfile((prevState) => ({
                ...prevState,
                profilePicture: url,
            }));
        } catch (error) {
            Alert.alert('Error uploading profile image:', error.message);
        }
    };

    const returnPress = () => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [
                { name: 'homeScreen' }
            ],
        }));
    };

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => {
                        auth.signOut().then(() => {
                            navigation.dispatch(CommonActions.reset({
                                index: 0,
                                routes: [
                                    { name: 'loginScreen' }
                                ],
                            }));
                        }).catch((error) => {
                            Alert.alert("Error signing out:", error.message);
                        });
                    }
                }
            ]
        );
    };

    const handleImageUpload = (imageUri) => {
        setTempImageUri(imageUri);
        setImage({ uri: imageUri });
    };

    const handleFirstNameChange = (value) => {
        const namePattern = /^[A-Za-z\s]*$/;
        if (value.match(namePattern) || value === '') {
            setFirstName(value);
        } else {
            Alert.alert('Error', 'First name should only contain English letters and spaces');
        }
    };

    const handleLastNameChange = (value) => {
        const namePattern = /^[A-Za-z\s]*$/;
        if (value.match(namePattern) || value === '') {
            setLastName(value);
        } else {
            Alert.alert('Error', 'Last name should only contain English letters and spaces');
        }
    };

    return (
        <ScrollView style={styles.scrollViewContainer}>
            <View style={styles.container}>
                <View style={{ marginVertical: 15 }}>
                    {email ? (
                        <UploadPhoto
                            storagePath="profile"
                            imageName={email.toLowerCase()}
                            defaultImage={ProfileImage} // Pass the local image as default
                            onImageUpload={handleImageUpload} // Handle image upload
                        />
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </View>

                <CustomInput
                    placeholder={initialData.firstName || "First Name"}
                    setValue={handleFirstNameChange}
                />

                <CustomInput
                    placeholder={initialData.lastName || "Last Name"}
                    setValue={handleLastNameChange}
                />

                <CustomInput
                    placeholder={initialData.phone || "Phone"}
                    setValue={setPhone}
                />

                <CustomInput
                    placeholder={initialData.password || "Password"}
                    secureTextEntry={true}
                    value={password}
                    setValue={setPassword}
                />

                <CustomButton
                    text="Save Changes"
                    onPress={saveDataPress}
                    bgColor={'green'}
                />

                <CustomButton
                    text="Cancel"
                    onPress={returnPress}
                    bgColor={'red'}
                />

                <CustomButton
                    text="Sign Out"
                    onPress={handleSignOut}
                    bgColor={'lightgrey'}
                    fgColor={'black'}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingBottom: 20, 
    },
    input: {
        height: 40,
        borderRadius: 12,
        paddingRight: 10,
        margin: 5,
        paddingLeft: 7,
        borderWidth: 1,
        textAlign: 'right',
    },
});

export default Profile;
