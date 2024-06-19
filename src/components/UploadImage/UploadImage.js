import React, { useState, useEffect } from 'react';
import { Image, View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Profile from '../../../assets/images/profile.png';
import { auth, db, storage } from '../../../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useActionSheet } from '@expo/react-native-action-sheet';

const UploadPhoto = () => {
    const user = auth.currentUser;
    const userEmail = user.email;

    const [image, setImage] = useState(null);
    const { showActionSheetWithOptions } = useActionSheet();

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (user.email) {
                try {
                    const url = await getDownloadURL(ref(storage, `profile/${user.email}`));
                    setImage(url);
                } catch (error) {
                    console.log('Error downloading image:', error);
                }
            }
        };

        fetchProfilePicture();
    }, []); 
    const showActionSheet = () => {
        const options = ['Upload from Gallery', 'Take a Picture', 'Cancel'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            buttonIndex => {
                if (buttonIndex === 0) {
                    uploadPic();
                } else if (buttonIndex === 1) {
                    takePic();
                }
            }
        );
    };

    const uploadPic = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled && result.assets && result.assets.length > 0) {
                const { uri } = result.assets[0];
                const imageName = userEmail;

                // Update UI immediately with selected image
                setImage(uri);

                // Upload image to Firebase Storage
                await uploadImage(uri, imageName);
            }
        } catch (error) {
            console.log('Error uploading image:', error);
            Alert.alert('Error', 'Failed to upload picture.');
        }
    };

    const takePic = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled && result.assets && result.assets.length > 0) {
                const { uri } = result.assets[0];
                const imageName = userEmail;

                setImage(uri);

                await uploadImage(uri, imageName);
            }
        } catch (error) {
            console.log('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo.');
        }
    };

    const uploadImage = async (uri, imageName) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `profile/${imageName}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            // Wait for upload to complete
            await uploadTask;

            // Update Firestore with image name
            await updateDoc(doc(db, 'users', user.uid), { proPic: imageName });

            // Optionally fetch and set the URL if needed
            const url = await getDownloadURL(storageRef);
            setImage(url); // Update UI with the URL if needed
        } catch (error) {
            console.log('Error uploading image:', error);
            throw error; // Handle error as needed
        }
    };

    return (
        <View style={imageUploaderStyles.container}>
            <Image source={image ? { uri: image } : Profile} style={{ width: 200, height: 200, borderRadius: 999 }} />
            <View style={imageUploaderStyles.uploadBtnContainer}>
                <TouchableOpacity onPress={showActionSheet} style={imageUploaderStyles.uploadBtn}>
                    <Text>{image ? 'Edit Image' : 'Upload Image'}</Text>
                    <AntDesign name="camera" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const imageUploaderStyles = StyleSheet.create({
    container: {
        elevation: 2,
        height: 200,
        width: 200,
        backgroundColor: '#efefef',
        position: 'relative',
        borderRadius: 999,
        overflow: 'hidden',
    },
    uploadBtnContainer: {
        opacity: 0.7,
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: 'lightgrey',
        width: '100%',
        height: '25%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    }
});

export default UploadPhoto;
