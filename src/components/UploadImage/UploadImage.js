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

// import React, { useState, useEffect } from 'react';
// import { Image, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// import { AntDesign } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// // import Profile from '../../assets/Images/profile.png';
// import Profile from '../../../assets/images/profile.png';

// // import { db, storage } from '../../firebase'; // Commented out for now
// // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // import { updateDoc, doc } from 'firebase/firestore';

// const UploadImage = (props) => {
//     const user = props.user;

//     const download = async () => {
//         // Placeholder function for downloading image URL
//         console.log('Downloading image...');
//         // Uncomment and use the following lines to integrate with Firebase
//         /*
//         getDownloadURL(ref(storage, "profile/" + user.pic)).then((url) => {
//             setImage(url);
//         })
//         .catch((e) => console.log('ERROR=>', e));
//         */
//     };

//     const [image, setImage] = useState(null);

//     // Showing profile image on page load
//     useEffect(() => {
//         if (user.pic != "") download();
//     }, []);

//     const uploadPic = async () => {
//         let result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: true,
//             aspect: [4, 3],
//             quality: 1,
//         });
//         if (!result.cancelled) {
//             setImage(result.uri); // Temporarily set image locally
//             console.log('Uploading image...');
//             // Uncomment and use the following lines to integrate with Firebase
//             /*
//             uploadImage(result.uri, user.pic).then(() => {
//                 download();
//                 console.log('Image uploaded successfully.');
//                 // let temp = user.pic;
//                 // Uncomment and use the following lines to integrate with Firebase
//                 // updateDoc(doc(db, 'users', user.id), { pic: "user.pic" });
//                 // updateDoc(doc(db, 'users', user.id), { pic: temp });
//             }).catch((error) => {
//                 alert("Image upload failed");
//             });
//             */
//         }
//     };

//     const takePic = async () => {
//         const { status } = await ImagePicker.requestCameraPermissionsAsync();
//         if (status !== 'granted') {
//             alert('Sorry, we need camera permissions to make this work!');
//             return;
//         }

//         let result = await ImagePicker.launchCameraAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: true,
//             aspect: [4, 3],
//             quality: 1,
//         });
//         if (!result.cancelled) {
//             setImage(result.uri); // Temporarily set image locally
//             console.log('Uploading image...');
//             // Uncomment and use the following lines to integrate with Firebase
//             /*
//             uploadImage(result.uri, user.pic).then(() => {
//                 download();
//                 console.log('Image uploaded successfully.');
//             }).catch((error) => {
//                 alert("Image upload failed");
//             });
//             */
//         }
//     };

//     const uploadImage = async (uri, imageName) => {
//         const response = await fetch(uri);
//         const blob = await response.blob();
//         console.log('Preparing image for upload...');
//         // Uncomment and use the following lines to integrate with Firebase
//         /*
//         let storageRef = ref(storage, "profile/" + imageName);
//         return uploadBytesResumable(storageRef, blob);
//         */
//     };

//     return (
//         <View style={imageUploaderStyles.container}>
//             <Image source={image ? { uri: image } : Profile} style={{ width: 200, height: 200 }} />
//             <View style={imageUploaderStyles.uploadBtnContainer}>
//                 <TouchableOpacity onPress={uploadPic} style={imageUploaderStyles.uploadBtn}>
//                     <Text>{image ? 'Edit Image' : 'Upload Image'} </Text>
//                     <AntDesign name="camera" size={20} color="black" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={takePic} style={imageUploaderStyles.uploadBtn}>
//                     <Text>Take Photo</Text>
//                     <AntDesign name="camerao" size={20} color="black" />
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// }

// export default UploadImage;

// const imageUploaderStyles = StyleSheet.create({
//     container: {
//         elevation: 2,
//         height: 200,
//         width: 200,
//         backgroundColor: '#efefef',
//         position: 'relative',
//         borderRadius: 999,
//         overflow: 'hidden',
//         alignSelf: 'center',
//     },
//     uploadBtnContainer: {
//         opacity: 0.7,
//         position: 'absolute',
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'lightgrey',
//         width: '100%',
//         height: '25%',
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         borderRadius: 999, // Added to make the corners circular
//     },
//     uploadBtn: {
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'fit-content',
//         flex: 1,
//     },
// });


// // import React, { useState, useEffect } from 'react';
// // import { Image, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// // import { AntDesign } from '@expo/vector-icons';
// // import * as ImagePicker from 'expo-image-picker';
// // import Profile from '../../../assets/images/profile.png';
// // // import { db, storage } from '../../firebase'; // Commented out for now
// // // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // // import { updateDoc, doc } from 'firebase/firestore';

// // const UploadImage = (props) => {
// //     const user = props.user;

// //     const download = async () => {
// //         // Placeholder function for downloading image URL
// //         console.log('Downloading image...');
// //         // Uncomment and use the following lines to integrate with Firebase
// //         /*
// //         getDownloadURL(ref(storage, "profile/" + user.pic)).then((url) => {
// //             setImage(url);
// //         })
// //         .catch((e) => console.log('ERROR=>', e));
// //         */
// //     };

// //     const [image, setImage] = useState(null);

// //     // Showing profile image on page load
// //     useEffect(() => {
// //         if (user.pic != "") download();
// //     }, []);

// //     const uploadPic = async () => {
// //         let result = await ImagePicker.launchImageLibraryAsync({
// //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //             allowsEditing: true,
// //             aspect: [4, 3],
// //             quality: 1,
// //         });
// //         if (!result.cancelled) {
// //             setImage(result.uri); // Temporarily set image locally
// //             console.log('Uploading image...');
// //             // Uncomment and use the following lines to integrate with Firebase
// //             /*
// //             uploadImage(result.uri, user.pic).then(() => {
// //                 download();
// //                 console.log('Image uploaded successfully.');
// //                 // let temp = user.pic;
// //                 // Uncomment and use the following lines to integrate with Firebase
// //                 // updateDoc(doc(db, 'users', user.id), { pic: "user.pic" });
// //                 // updateDoc(doc(db, 'users', user.id), { pic: temp });
// //             }).catch((error) => {
// //                 alert("Image upload failed");
// //             });
// //             */
// //         }
// //     };

// //     const takePic = async () => {
// //         let result = await ImagePicker.launchCameraAsync({
// //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
// //             allowsEditing: true,
// //             aspect: [4, 3],
// //             quality: 1,
// //         });
// //         if (!result.cancelled) {
// //             setImage(result.uri); // Temporarily set image locally
// //             console.log('Uploading image...');
// //             // Uncomment and use the following lines to integrate with Firebase
// //             /*
// //             uploadImage(result.uri, user.pic).then(() => {
// //                 download();
// //                 console.log('Image uploaded successfully.');
// //             }).catch((error) => {
// //                 alert("Image upload failed");
// //             });
// //             */
// //         }
// //     };

// //     const uploadImage = async (uri, imageName) => {
// //         const response = await fetch(uri);
// //         const blob = await response.blob();
// //         console.log('Preparing image for upload...');
// //         // Uncomment and use the following lines to integrate with Firebase
// //         /*
// //         let storageRef = ref(storage, "profile/" + imageName);
// //         return uploadBytesResumable(storageRef, blob);
// //         */
// //     };

// //     return (
// //         <View style={imageUploaderStyles.container}>
// //             <Image source={image ? { uri: image } : Profile} style={{ width: 200, height: 200 }} />
// //             <View style={imageUploaderStyles.uploadBtnContainer}>
// //                 <TouchableOpacity onPress={uploadPic} style={imageUploaderStyles.uploadBtn}>
// //                     <Text>{image ? 'Edit Image' : 'Upload Image'} </Text>
// //                     <AntDesign name="camera" size={20} color="black" />
// //                 </TouchableOpacity>
// //             </View>
// //         </View>
// //     );
// // }

// // export default UploadImage;

// // const imageUploaderStyles = StyleSheet.create({
// //     container: {
// //         elevation: 2,
// //         height: 200,
// //         width: 200,
// //         backgroundColor: '#efefef',
// //         position: 'relative',
// //         borderRadius: 999,
// //         overflow: 'hidden',
// //         alignSelf: 'center',
// //     },
// //     uploadBtnContainer: {
// //         opacity: 0.7,
// //         position: 'absolute',
// //         right: 0,
// //         bottom: 0,
// //         backgroundColor: 'lightgrey',
// //         width: '100%',
// //         height: '25%',
// //     },
// //     uploadBtn: {
// //         display: 'flex',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// // });

// // // import React, { useState, useEffect } from 'react';
// // // import { Image, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
// // // import { AntDesign } from '@expo/vector-icons';
// // // import * as ImagePicker from 'expo-image-picker';
// // // import ProfilePic from '../../../assets/images/profile.png';
// // // const UploadImage = ({ user }) => {
// // //     const [image, setImage] = useState(null);

// // //     const download = async () => {
// // //         // Placeholder function for downloading image URL
// // //         // You can replace this with actual download logic
// // //         console.log('Downloading image...');
// // //     };

// // //     useEffect(() => {
// // //         if (user.pic !== "") download();
// // //     }, []);

// // //     const uploadPic = async () => {
// // //         let result = await ImagePicker.launchImageLibraryAsync({
// // //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
// // //             allowsEditing: true,
// // //             aspect: [4, 3],
// // //             quality: 1,
// // //         });

// // //         if (!result.cancelled) {
// // //             setImage(result.uri);
// // //             // Placeholder function call for upload logic
// // //             console.log('Uploading image...');
// // //         }
// // //     };

// // //     const takePic = async () => {
// // //         let result = await ImagePicker.launchCameraAsync({
// // //             mediaTypes: ImagePicker.MediaTypeOptions.Images,
// // //             allowsEditing: true,
// // //             aspect: [4, 3],
// // //             quality: 1,
// // //         });

// // //         if (!result.cancelled) {
// // //             setImage(result.uri);
// // //             // Placeholder function call for upload logic
// // //             download();
// // //             let temp = user.pic;
// // //             console.log('Uploading image...');
// // //         }
// // //     };

// // //     return (
// // //         <View style={imageUploaderStyles.container}>
// // //             <Image source={image ? { uri: image } : ProfilePic} style={{ width: 200, height: 200 }} />
// // //             <View style={imageUploaderStyles.uploadBtnContainer}>
// // //                 <TouchableOpacity onPress={uploadPic} style={imageUploaderStyles.uploadBtn}>
// // //                     <Text>{image ? 'Edit Image' : 'Upload Image'} </Text>
// // //                     <AntDesign name="camera" size={20} color="black" />
// // //                 </TouchableOpacity>
// // //             </View>
// // //         </View>
// // //     );
// // // };

// // // export default UploadImage;

// // // const imageUploaderStyles = StyleSheet.create({
// // //     container: {
// // //         elevation: 2,
// // //         height: 200,
// // //         width: 200,
// // //         backgroundColor: '#efefef',
// // //         position: 'relative',
// // //         borderRadius: 999,
// // //         overflow: 'hidden',
// // //         alignSelf: 'center',
// // //     },
// // //     uploadBtnContainer: {
// // //         opacity: 0.7,
// // //         position: 'absolute',
// // //         right: 0,
// // //         bottom: 0,
// // //         backgroundColor: 'lightgrey',
// // //         width: '100%',
// // //         height: '25%',
// // //     },
// // //     uploadBtn: {
// // //         display: 'flex',
// // //         alignItems: 'center',
// // //         justifyContent: 'center',
// // //     },
// // // });
