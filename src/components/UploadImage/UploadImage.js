import React, { useState, useEffect } from 'react';
import { Image, View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../../firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';
import { useActionSheet } from '@expo/react-native-action-sheet';

const UploadPhoto = ({ storagePath, imageName, defaultImage, onImageUpload, shouldFetch = true }) => {
    const [image, setImage] = useState(null);
    const { showActionSheetWithOptions } = useActionSheet();

    useEffect(() => {
        if (shouldFetch) {
            const fetchProfilePicture = async () => {
                try {
                    const url = await getDownloadURL(ref(storage, `${storagePath}/${imageName.toLowerCase()}`));
                    setImage(url);
                } catch (error) {
                    Alert.alert('Error', 'Failed to download image.');
                }
            };

            fetchProfilePicture();
        }
    }, [shouldFetch, storagePath, imageName]);

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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const { uri } = result.assets[0];
                setImage(uri);
                onImageUpload && onImageUpload(uri);
            }
        } catch (error) {
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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const { uri } = result.assets[0];
                setImage(uri);
                onImageUpload && onImageUpload(uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo.');
        }
    };

    return (
        <View style={imageUploaderStyles.container}>
            <Image source={image ? { uri: image } : defaultImage} style={{ width: 200, height: 200, borderRadius: 999 }} />
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
