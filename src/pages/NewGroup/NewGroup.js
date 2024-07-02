import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db, storage } from '../../../firebaseConfig';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { CommonActions } from '@react-navigation/native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import UploadPhoto from '../../components/UploadImage/UploadImage';
import communLogo from '../../../assets/images/communLogo.jpg';

const NewGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [tempImageUri, setTempImageUri] = useState(null);

    const user = auth.currentUser;
    const uId = user.uid;

    const navigation = useNavigation();

    const handleSave = async () => {
        if (!groupName) {
            Alert.alert('Error', 'Group Name is required');
            return;
        }

        const groupData = {
            groupName: groupName,
            desc: groupDescription,
            groupAdmins: [uId],
            participants: [uId],
            groupImage: groupName, // Save the group name as the image reference
        };

        try {
            const groupRef = await addDoc(collection(db, 'groups'), groupData);
            console.log("Group created with ID: ", groupRef.id);

            // Upload the image after the group is created
            if (tempImageUri) {
                await uploadGroupImage(tempImageUri, groupRef.id, groupName);
            }

            Alert.alert('Success', 'Group created successfully');
            navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'homeScreen' }],
            }));
        } catch (error) {
            console.log('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group');
        }
    };

    const uploadGroupImage = async (uri, groupId, groupName) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const storageRef = ref(storage, `groupPic/${groupName}`);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            await uploadTask;

            // No need to fetch the download URL, just save the group name in the Firestore document
            await updateDoc(doc(db, 'groups', groupId), { groupImage: groupName });
        } catch (error) {
            console.log('Error uploading group image:', error);
        }
    };

    const cancelPress = () => {
        navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: 'homeScreen' }],
        }));
    };

    const handleImageUpload = (imageUri) => {
        setTempImageUri(imageUri);
    };

    return (
        <View style={styles.container}>
            <UploadPhoto 
                storagePath="groupPic" 
                imageName={groupName} 
                defaultImage={communLogo} 
                onImageUpload={handleImageUpload} 
            />
            <CustomInput 
                value={groupName}
                setValue={setGroupName}
                placeholder="Enter group name"
            />
            <CustomInput 
                value={groupDescription}
                setValue={setGroupDescription}
                placeholder="Enter group description" 
            />
            <CustomButton 
                text="Save"
                title="Save" 
                onPress={handleSave} 
            />
            <CustomButton 
                text="Cancel"
                title="Cancel" 
                onPress={cancelPress} 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
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

export default NewGroup;

// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { auth, db, storage } from '../../../firebaseConfig';
// import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { CommonActions } from '@react-navigation/native';
// import CustomInput from '../../components/CustomInput';
// import CustomButton from '../../components/CustomButton';
// import UploadPhoto from '../../components/UploadImage/UploadImage';
// import communLogo from '../../../assets/images/communLogo.jpg';

// const NewGroup = () => {
//     const [groupName, setGroupName] = useState('');
//     const [groupDescription, setGroupDescription] = useState('');
//     const [tempImageUri, setTempImageUri] = useState(null);

//     const user = auth.currentUser;
//     const uId = user.uid;

//     const navigation = useNavigation();

//     const handleSave = async () => {
//         if (!groupName) {
//             Alert.alert('Error', 'Group Name is required');
//             return;
//         }

//         const groupData = {
//             groupName: groupName,
//             desc: groupDescription,
//             groupAdmins: [uId],
//             participants: [uId],
//             groupImage: communLogo, // Default image, will be updated later if necessary
//         };

//         try {
//             const groupRef = await addDoc(collection(db, 'groups'), groupData);
//             console.log("Group created with ID: ", groupRef.id);

//             // Upload the image after the group is created
//             if (tempImageUri) {
//                 await uploadGroupImage(tempImageUri, groupRef.id, groupName);
//             }

//             Alert.alert('Success', 'Group created successfully');
//             navigation.dispatch(CommonActions.reset({
//                 index: 0,
//                 routes: [{ name: 'homeScreen' }],
//             }));
//         } catch (error) {
//             console.log('Error creating group:', error);
//             Alert.alert('Error', 'Failed to create group');
//         }
//     };

//     const uploadGroupImage = async (uri, groupId, groupName) => {
//         try {
//             const response = await fetch(uri);
//             const blob = await response.blob();
//             const storageRef = ref(storage, `groupPic/${groupName}`);
//             const uploadTask = uploadBytesResumable(storageRef, blob);

//             await uploadTask;

//             const downloadURL = await getDownloadURL(storageRef);
//             await updateDoc(doc(db, 'groups', groupId), { groupImage: downloadURL });
//         } catch (error) {
//             console.log('Error uploading group image:', error);
//         }
//     };

//     const cancelPress = () => {
//         navigation.dispatch(CommonActions.reset({
//             index: 0,
//             routes: [{ name: 'homeScreen' }],
//         }));
//     };

//     const handleImageUpload = (imageUri) => {
//         setTempImageUri(imageUri);
//     };

//     return (
//         <View style={styles.container}>
//             <UploadPhoto 
//                 storagePath="groupPic" 
//                 imageName={groupName} 
//                 defaultImage={communLogo} 
//                 onImageUpload={handleImageUpload} 
//             />
//             <CustomInput 
//                 value={groupName}
//                 setValue={setGroupName}
//                 placeholder="Enter group name"
//             />
//             <CustomInput 
//                 value={groupDescription}
//                 setValue={setGroupDescription}
//                 placeholder="Enter group description" 
//             />
//             <CustomButton 
//                 text="Save"
//                 title="Save" 
//                 onPress={handleSave} 
//             />
//             <CustomButton 
//                 text="Cancel"
//                 title="Cancel" 
//                 onPress={cancelPress} 
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         paddingTop: 20,
//         backgroundColor: '#fff',
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 16,
//     },
//     subtitle: {
//         fontSize: 18,
//         color: '#888',
//     },
// });

// export default NewGroup;

// // import React, { useState } from 'react';
// // import { View, Text, StyleSheet, Alert } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { auth, db, storage } from '../../../firebaseConfig';
// // import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
// // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // import { CommonActions } from '@react-navigation/native';
// // import CustomInput from '../../components/CustomInput';
// // import CustomButton from '../../components/CustomButton';
// // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // import communLogo from '../../../assets/images/communLogo.jpg';

// // const NewGroup = () => {
// //     const [groupName, setGroupName] = useState('');
// //     const [groupDescription, setGroupDescription] = useState('');
// //     const [tempImageUri, setTempImageUri] = useState(null);

// //     const user = auth.currentUser;
// //     const uId = user.uid;

// //     const navigation = useNavigation();

// //     const handleSave = async () => {
// //         if (!groupName) {
// //             Alert.alert('Error', 'Group Name is required');
// //             return;
// //         }

// //         const groupData = {
// //             groupName: groupName,
// //             desc: groupDescription,
// //             groupAdmins: [uId],
// //             participants: [uId],
// //             groupImage: communLogo, // Default image, will be updated later if necessary
// //         };

// //         try {
// //             const groupRef = await addDoc(collection(db, 'groups'), groupData);
// //             console.log("Group created with ID: ", groupRef.id);

// //             // Upload the image after the group is created
// //             if (tempImageUri) {
// //                 console.log("tempImageUri: ", tempImageUri);
// //                 await uploadGroupImage(tempImageUri, groupRef.id);
// //             }

// //             Alert.alert('Success', 'Group created successfully');
// //             navigation.dispatch(CommonActions.reset({
// //                 index: 0,
// //                 routes: [{ name: 'homeScreen' }],
// //             }));
// //         } catch (error) {
// //             console.log('Error creating group:', error);
// //             Alert.alert('Error', 'Failed to create group');
// //         }
// //     };

// //     const uploadGroupImage = async (uri, groupId) => {
// //         try {
// //             const response = await fetch(uri);
// //             const blob = await response.blob();
// //             const storageRef = ref(storage, `groupPic/${groupName}`);
// //             const uploadTask = uploadBytesResumable(storageRef, blob);

// //             await uploadTask;

// //             const downloadURL = await getDownloadURL(storageRef);
// //             await updateDoc(doc(db, 'groups', groupId), { groupImage: downloadURL });
// //         } catch (error) {
// //             console.log('Error uploading group image:', error);
// //         }
// //     };

// //     const cancelPress = () => {
// //         navigation.dispatch(CommonActions.reset({
// //             index: 0,
// //             routes: [{ name: 'homeScreen' }],
// //         }));
// //     };

// //     const handleImageUpload = (imageUri) => {
// //         setTempImageUri(imageUri);
// //     };

// //     return (
// //         <View style={styles.container}>
// //             <UploadPhoto 
// //                 storagePath="groupPic" 
// //                 imageName={groupName} 
// //                 defaultImage={communLogo} 
// //                 onImageUpload={handleImageUpload} 
// //             />
// //             <CustomInput 
// //                 value={groupName}
// //                 setValue={setGroupName}
// //                 placeholder="Enter group name"
// //             />
// //             <CustomInput 
// //                 value={groupDescription}
// //                 setValue={setGroupDescription}
// //                 placeholder="Enter group description" 
// //             />
// //             <CustomButton 
// //                 text="Save"
// //                 title="Save" 
// //                 onPress={handleSave} 
// //             />
// //             <CustomButton 
// //                 text="Cancel"
// //                 title="Cancel" 
// //                 onPress={cancelPress} 
// //             />
// //         </View>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         alignItems: 'center',
// //         paddingTop: 20,
// //         backgroundColor: '#fff',
// //     },
// //     title: {
// //         fontSize: 24,
// //         fontWeight: 'bold',
// //         marginBottom: 16,
// //     },
// //     subtitle: {
// //         fontSize: 18,
// //         color: '#888',
// //     },
// // });

// // export default NewGroup;

// // // import React, { useState } from 'react';
// // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // import { useNavigation } from '@react-navigation/native';
// // // import { auth, db, storage } from '../../../firebaseConfig';
// // // import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
// // // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // // import { CommonActions } from '@react-navigation/native';
// // // import CustomInput from '../../components/CustomInput';
// // // import CustomButton from '../../components/CustomButton';
// // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // import communPic from '../../../assets/images/communLogo.jpg';

// // // const NewGroup = () => {
// // //     const [groupName, setGroupName] = useState('');
// // //     const [groupDescription, setGroupDescription] = useState('');
// // //     const [tempImageUri, setTempImageUri] = useState(null);

// // //     const user = auth.currentUser;
// // //     const uId = user.uid;

// // //     const navigation = useNavigation();

// // //     const handleSave = async () => {
// // //         if (!groupName) {
// // //             Alert.alert('Error', 'Group Name is required');
// // //             return;
// // //         }

// // //         const groupData = {
// // //             groupName: groupName,
// // //             desc: groupDescription,
// // //             groupAdmins: [uId],
// // //             participants: [uId],
// // //             groupImage: communPic, // Default image, will be updated later if necessary
// // //         };

// // //         try {
// // //             const groupRef = await addDoc(collection(db, 'groups'), groupData);
// // //             console.log("Group created with ID: ", groupRef.id);

// // //             // Upload the image after the group is created
// // //             if (tempImageUri) {
// // //                 await uploadGroupImage(tempImageUri, groupRef.id);
// // //             }

// // //             Alert.alert('Success', 'Group created successfully');
// // //             navigation.dispatch(CommonActions.reset({
// // //                 index: 0,
// // //                 routes: [{ name: 'homeScreen' }],
// // //             }));
// // //         } catch (error) {
// // //             console.log('Error creating group:', error);
// // //             Alert.alert('Error', 'Failed to create group');
// // //         }
// // //     };

// // //     const uploadGroupImage = async (uri, groupId) => {
// // //         try {
// // //             const response = await fetch(uri);
// // //             const blob = await response.blob();
// // //             const storageRef = ref(storage, `groupPic/${groupId}`);
// // //             const uploadTask = uploadBytesResumable(storageRef, blob);

// // //             // Wait for upload to complete
// // //             await uploadTask;

// // //             // Get the download URL and update the group document
// // //             const downloadURL = await getDownloadURL(storageRef);
// // //             await updateDoc(doc(db, 'groups', groupId), { groupImage: downloadURL });
// // //         } catch (error) {
// // //             console.log('Error uploading group image:', error);
// // //         }
// // //     };

// // //     const cancelPress = () => {
// // //         navigation.dispatch(CommonActions.reset({
// // //             index: 0,
// // //             routes: [{ name: 'homeScreen' }],
// // //         }));
// // //     };

// // //     const handleImageUpload = (imageUri) => {
// // //         setTempImageUri(imageUri);
// // //     };

// // //     return (
// // //         <View style={styles.container}>
// // //             <UploadPhoto 
// // //                 storagePath="groupPic" 
// // //                 onImageUpload={handleImageUpload} 
// // //                 imageName={null} // No initial image
// // //             />
// // //             <CustomInput 
// // //                 value={groupName}
// // //                 setValue={setGroupName}
// // //                 placeholder="Enter group name"
// // //             />
// // //             <CustomInput 
// // //                 value={groupDescription}
// // //                 setValue={setGroupDescription}
// // //                 placeholder="Enter group description" 
// // //             />
// // //             <CustomButton 
// // //                 text="Save"
// // //                 title="Save" 
// // //                 onPress={handleSave} 
// // //             />
// // //             <CustomButton 
// // //                 text="Cancel"
// // //                 title="Cancel" 
// // //                 onPress={cancelPress} 
// // //             />
// // //         </View>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         alignItems: 'center',
// // //         paddingTop: 20,
// // //         backgroundColor: '#fff',
// // //     },
// // //     title: {
// // //         fontSize: 24,
// // //         fontWeight: 'bold',
// // //         marginBottom: 16,
// // //     },
// // //     subtitle: {
// // //         fontSize: 18,
// // //         color: '#888',
// // //     },
// // // });

// // // export default NewGroup;

// // // // import React, { useState } from 'react';
// // // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // // import { useNavigation } from '@react-navigation/native';
// // // // import { auth, db, storage } from '../../../firebaseConfig';
// // // // import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
// // // // import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// // // // import { CommonActions } from '@react-navigation/native';
// // // // import CustomInput from '../../components/CustomInput';
// // // // import CustomButton from '../../components/CustomButton';
// // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // import communPic from '../../../assets/images/communLogo.jpg';

// // // // const NewGroup = () => {
// // // //     const [groupName, setGroupName] = useState('');
// // // //     const [groupDescription, setGroupDescription] = useState('');
// // // //     const [groupImage, setGroupImage] = useState(null);
// // // //     const [tempImageUri, setTempImageUri] = useState(null);

// // // //     const user = auth.currentUser;
// // // //     const uId = user.uid;

// // // //     const navigation = useNavigation();

// // // //     const handleSave = async () => {
// // // //         if (!groupName) {
// // // //             Alert.alert('Error', 'Group Name is required');
// // // //             return;
// // // //         }

// // // //         const groupData = {
// // // //             groupName: groupName,
// // // //             desc: groupDescription,
// // // //             groupAdmins: [uId],
// // // //             participants: [uId],
// // // //             groupImage: null, // Initially set to null
// // // //         };

// // // //         try {
// // // //             const groupRef = await addDoc(collection(db, 'groups'), groupData);
// // // //             console.log("Group created with ID: ", groupRef.id);

// // // //             // Upload the image after the group is created
// // // //             if (tempImageUri) {
// // // //                 await uploadGroupImage(tempImageUri, groupRef.id);
// // // //             }

// // // //             Alert.alert('Success', 'Group created successfully');
// // // //             navigation.dispatch(CommonActions.reset({
// // // //                 index: 0,
// // // //                 routes: [{ name: 'homeScreen' }],
// // // //             }));
// // // //         } catch (error) {
// // // //             console.log('Error creating group:', error);
// // // //             Alert.alert('Error', 'Failed to create group');
// // // //         }
// // // //     };

// // // //     const uploadGroupImage = async (uri, groupId) => {
// // // //         try {
// // // //             const response = await fetch(uri);
// // // //             const blob = await response.blob();
// // // //             const storageRef = ref(storage, `groupPic/${groupId}`);
// // // //             const uploadTask = uploadBytesResumable(storageRef, blob);

// // // //             // Wait for upload to complete
// // // //             await uploadTask;

// // // //             // Get the download URL and update the group document
// // // //             const downloadURL = await getDownloadURL(storageRef);
// // // //             await updateDoc(doc(db, 'groups', groupId), { groupImage: downloadURL });
// // // //             setGroupImage(downloadURL);
// // // //         } catch (error) {
// // // //             console.log('Error uploading group image:', error);
// // // //         }
// // // //     };

// // // //     const cancelPress = () => {
// // // //         navigation.dispatch(CommonActions.reset({
// // // //             index: 0,
// // // //             routes: [{ name: 'homeScreen' }],
// // // //         }));
// // // //     };

// // // //     const handleImageUpload = (imageUri) => {
// // // //         setTempImageUri(imageUri);
// // // //     };

// // // //     return (
// // // //         <View style={styles.container}>
// // // //             <UploadPhoto 
// // // //                 storagePath="groupPic" 
// // // //                 onImageUpload={handleImageUpload} 
// // // //                 imageName={null} // Initially null, will be updated later
// // // //             />
// // // //             <CustomInput 
// // // //                 value={groupName}
// // // //                 setValue={setGroupName}
// // // //                 placeholder="Enter group name"
// // // //             />
// // // //             <CustomInput 
// // // //                 value={groupDescription}
// // // //                 setValue={setGroupDescription}
// // // //                 placeholder="Enter group description" 
// // // //             />
// // // //             <CustomButton 
// // // //                 text="Save"
// // // //                 title="Save" 
// // // //                 onPress={handleSave} 
// // // //             />
// // // //             <CustomButton 
// // // //                 text="Cancel"
// // // //                 title="Cancel" 
// // // //                 onPress={cancelPress} 
// // // //             />
// // // //         </View>
// // // //     );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //     container: {
// // // //         flex: 1,
// // // //         alignItems: 'center',
// // // //         paddingTop: 20,
// // // //         backgroundColor: '#fff',
// // // //     },
// // // //     title: {
// // // //         fontSize: 24,
// // // //         fontWeight: 'bold',
// // // //         marginBottom: 16,
// // // //     },
// // // //     subtitle: {
// // // //         fontSize: 18,
// // // //         color: '#888',
// // // //     },
// // // // });


// // // // export default NewGroup;

// // // // // import React, { useState } from 'react';
// // // // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // // // import { useNavigation } from '@react-navigation/native';
// // // // // import { auth, db } from '../../../firebaseConfig';
// // // // // import { addDoc, collection } from 'firebase/firestore';
// // // // // import { CommonActions } from '@react-navigation/native';
// // // // // import CustomInput from '../../components/CustomInput';
// // // // // import CustomButton from '../../components/CustomButton';
// // // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // // import communPic from '../../../assets/images/communLogo.jpg';

// // // // // const NewGroup = () => {
// // // // //     const [groupName, setGroupName] = useState('');
// // // // //     const [groupDescription, setGroupDescription] = useState('');
// // // // //     const [groupImage, setGroupImage] = useState(null);
// // // // //     const [tempImageUri, setTempImageUri] = useState(null);

// // // // //     const user = auth.currentUser;
// // // // //     const uId = user.uid;

// // // // //     const navigation = useNavigation();


    

// // // // //     const handleSave = async () => {
// // // // //         if (!groupName) {
// // // // //             Alert.alert('Error', 'Group Name is required');
// // // // //             return;
// // // // //         }
    
// // // // //         const groupData = {
// // // // //             groupName: groupName,
// // // // //             desc: groupDescription,
// // // // //             groupAdmins: [uId],
// // // // //             participants: [uId],
// // // // //             groupImage: communPic,
// // // // //         };
    
// // // // //         try {
// // // // //             const groupRef = await addDoc(collection(db, 'groups'), groupData);
// // // // //             console.log("Group created with ID: ", groupRef.id);
    
// // // // //             // Upload the image after the group is created
// // // // //             if (tempImageUri) {
// // // // //                 await uploadGroupImage(tempImageUri, groupRef.id);
// // // // //             }
    
// // // // //             Alert.alert('Success', 'Group created successfully');
// // // // //             navigation.dispatch(CommonActions.reset({
// // // // //                 index: 0,
// // // // //                 routes: [{ name: 'homeScreen' }],
// // // // //             }));
// // // // //         } catch (error) {
// // // // //             console.log('Error creating group:', error);
// // // // //             Alert.alert('Error', 'Failed to create group');
// // // // //         }
// // // // //     };
    
// // // // //     const uploadGroupImage = async (uri, groupId) => {
// // // // //         try {
// // // // //             const response = await fetch(uri);
// // // // //             const blob = await response.blob();
// // // // //             const storageRef = ref(storage, `groupPic/${groupId}`);
// // // // //             const uploadTask = uploadBytesResumable(storageRef, blob);
    
// // // // //             // Wait for upload to complete
// // // // //             await uploadTask;
    
// // // // //             // Get the download URL and update the group document
// // // // //             const downloadURL = await getDownloadURL(storageRef);
// // // // //             await updateDoc(doc(db, 'groups', groupId), { groupImage: downloadURL });
// // // // //             setGroupImage(downloadURL);
// // // // //         } catch (error) {
// // // // //             console.log('Error uploading group image:', error);
// // // // //         }
// // // // //     };
    

// // // // //     const cancelPress = () => {
// // // // //         navigation.dispatch(CommonActions.reset({
// // // // //             index: 0,
// // // // //             routes: [{ name: 'homeScreen' }],
// // // // //         }));
// // // // //     };

// // // // //     const handleImageUpload = (imageUrl) => {
// // // // //         setTempImageUri(imageUrl);
// // // // //     };
// // // // //     return (
// // // // //         <View style={styles.container}>
// // // // //             <UploadPhoto 
// // // // //                 storagePath="groupPic" 
// // // // //                 onImageUpload={handleImageUpload} 
// // // // //                 imageName={groupName} // Pass groupName to be used as the image name
// // // // // />
// // // // //             <CustomInput 
// // // // //                 value={groupName}
// // // // //                 setValue={setGroupName}
// // // // //                 placeholder="Enter group name"
// // // // //             />
// // // // //             <CustomInput 
// // // // //                 value={groupDescription}
// // // // //                 setValue={setGroupDescription}
// // // // //                 placeholder="Enter group description" 
// // // // //             />
// // // // //             <CustomButton 
// // // // //                 text="Save"
// // // // //                 title="Save" 
// // // // //                 onPress={handleSave} 
// // // // //             />
// // // // //             <CustomButton 
// // // // //                 text="Cancel"
// // // // //                 title="Cancel" 
// // // // //                 onPress={cancelPress} 
// // // // //             />
// // // // //         </View>
// // // // //     );
// // // // // };

// // // // // const styles = StyleSheet.create({
// // // // //     container: {
// // // // //         flex: 1,
// // // // //         alignItems: 'center',
// // // // //         paddingTop: 20,
// // // // //         backgroundColor: '#fff',
// // // // //     },
// // // // //     title: {
// // // // //         fontSize: 24,
// // // // //         fontWeight: 'bold',
// // // // //         marginBottom: 16,
// // // // //     },
// // // // //     subtitle: {
// // // // //         fontSize: 18,
// // // // //         color: '#888',
// // // // //     },
// // // // // });


// // // // // export default NewGroup;

// // // // // // import React, { useState } from 'react';
// // // // // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // // // // import { useNavigation } from '@react-navigation/native';
// // // // // // import { auth, db } from '../../../firebaseConfig';
// // // // // // import { doc, setDoc } from 'firebase/firestore';
// // // // // // import { CommonActions } from '@react-navigation/native';
// // // // // // import CustomInput from '../../components/CustomInput';
// // // // // // import CustomButton from '../../components/CustomButton';
// // // // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // // // import communPic from '../../../assets/images/communLogo.jpg';

// // // // // // const NewGroup = () => {
// // // // // //     const [groupName, setGroupName] = useState('');
// // // // // //     const [groupDescription, setGroupDescription] = useState('');
// // // // // //     const [groupImage, setGroupImage] = useState(null);

// // // // // //     const user = auth.currentUser;
// // // // // //     const uId = user.uid;

// // // // // //     const navigation = useNavigation();

// // // // // //     const handleSave = async () => {
// // // // // //         if (!groupName) {
// // // // // //             Alert.alert('Error', 'Group Name is required');
// // // // // //             return;
// // // // // //         }

// // // // // //         const groupRef = doc(db, 'groups');  // Create a reference without an ID to generate a unique ID
// // // // // //         const groupId = groupRef.id;  // Get the generated ID

// // // // // //         const groupData = {
// // // // // //             groupName: groupName,
// // // // // //             desc: groupDescription,
// // // // // //             groupAdmins: [uId],
// // // // // //             participants: [uId],
// // // // // //             groupImage: communPic
// // // // // //         };

// // // // // //         try {
// // // // // //             await setDoc(db, "groups", uId);  // Save the document with the generated ID
// // // // // //             console.log("group data: ", groupData);
// // // // // //             Alert.alert('Success', 'Group created successfully');
// // // // // //             navigation.dispatch(CommonActions.reset({
// // // // // //                 index: 0,
// // // // // //                 routes: [{ name: 'homeScreen' }],
// // // // // //             }));
// // // // // //         } catch (error) {
// // // // // //             console.log('Error creating group:', error);
// // // // // //             Alert.alert('Error', 'Failed to create group');
// // // // // //         }
// // // // // //     };

// // // // // //     const cancelPress = () => {
// // // // // //         navigation.dispatch(CommonActions.reset({
// // // // // //             index: 0,
// // // // // //             routes: [{ name: 'homeScreen' }],
// // // // // //         }));
// // // // // //     };

// // // // // //     const handleImageUpload = (imageUrl) => {
// // // // // //         setGroupImage(imageUrl);
// // // // // //     };

// // // // // //     return (
// // // // // //         <View style={styles.container}>
// // // // // //             <UploadPhoto onImageUpload={handleImageUpload} />
// // // // // //             <CustomInput 
// // // // // //                 value={groupName}
// // // // // //                 setValue={setGroupName}
// // // // // //                 placeholder="Enter group name"
// // // // // //             />
// // // // // //             <CustomInput 
// // // // // //                 value={groupDescription}
// // // // // //                 setValue={setGroupDescription}
// // // // // //                 placeholder="Enter group description" 
// // // // // //             />
// // // // // //             <CustomButton 
// // // // // //                 text="Save"
// // // // // //                 title="Save" 
// // // // // //                 onPress={handleSave} 
// // // // // //             />
// // // // // //             <CustomButton 
// // // // // //                 text="Cancel"
// // // // // //                 title="Cancel" 
// // // // // //                 onPress={cancelPress} 
// // // // // //             />
// // // // // //         </View>
// // // // // //     );
// // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //     container: {
// // // // // //         flex: 1,
// // // // // //         alignItems: 'center',
// // // // // //         justifyContent: 'center',
// // // // // //         padding: 20,
// // // // // //     },
// // // // // // });

// // // // // // export default NewGroup;


// // // // // // import React, { useState } from 'react';
// // // // // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // // // // import { useNavigation } from '@react-navigation/native';
// // // // // // import { auth, db } from '../../../firebaseConfig';
// // // // // // import { doc, setDoc } from 'firebase/firestore';
// // // // // // import { CommonActions } from '@react-navigation/native';
// // // // // // import CustomInput from '../../components/CustomInput';
// // // // // // import CustomButton from '../../components/CustomButton';
// // // // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // // // import { ScrollView } from 'react-native-gesture-handler';
// // // // // // import communPic from '../../../assets/images/communLogo.jpg';

// // // // // // const NewGroup = () => {
// // // // // //     const [groupName, setGroupName] = useState('');
// // // // // //     const [groupDescription, setGroupDescription] = useState('');
// // // // // //     const [groupImage, setGroupImage] = useState(null);

// // // // // //     const user = auth.currentUser;
// // // // // //     const uId = user.uid;

// // // // // //     const navigation = useNavigation();

// // // // // //     const handleSave = async () => {
// // // // // //         if (!groupName) {
// // // // // //             Alert.alert('Error', 'Group Name is required');
// // // // // //             return;
// // // // // //         }

// // // // // //         const groupRef = doc(db, 'groups');  // Create a reference without an ID to generate a unique ID
// // // // // //         const groupId = groupRef.id;  // Get the generated ID

// // // // // //         const groupData = {
// // // // // //             groupName: groupName,
// // // // // //             desc: groupDescription,
// // // // // //             groupAdmins: [uId],
// // // // // //             participants: [uId],
// // // // // //             groupImage: communPic
// // // // // //         };

// // // // // //         try {
// // // // // //             await setDoc(groupRef, groupData);  // Save the document with the generated ID
// // // // // //             console.log("group data: ", groupData);
// // // // // //             Alert.alert('Success', 'Group created successfully');
// // // // // //             navigation.dispatch(CommonActions.reset({
// // // // // //                 index: 0,
// // // // // //                 routes: [{ name: 'homeScreen' }],
// // // // // //             }));
// // // // // //         } catch (error) {
// // // // // //             console.log('Error creating group:', error);
// // // // // //             Alert.alert('Error', 'Failed to create group');
// // // // // //         }
// // // // // //     };

// // // // // //     const cancelPress = () => {
// // // // // //         navigation.dispatch(CommonActions.reset({
// // // // // //             index: 0,
// // // // // //             routes: [{ name: 'homeScreen' }],
// // // // // //         }));
// // // // // //     };

// // // // // //     const handleImageUpload = (imageUrl) => {
// // // // // //         setGroupImage(imageUrl);
// // // // // //     };

// // // // // //     return (
// // // // // //         <View style={styles.container}>
// // // // // //             <UploadPhoto onImageUpload={handleImageUpload} />
// // // // // //                     <CustomInput 
// // // // // //                     label="Group Name"
// // // // // //                     onChangeText={setGroupName}
// // // // // //                     placeholder="Enter group name"
// // // // // //                      />
// // // // // //             <CustomInput 
// // // // // //                     label="Group Description"
// // // // // //                     onChangeText={setGroupDescription}
// // // // // //                     placeholder="Enter group description" 
// // // // // //                      />

// // // // // //             <CustomButton 
// // // // // //                     text="Save"
// // // // // //                     title = "Save" 
// // // // // //                     onPress={handleSave} 
// // // // // //                 />
// // // // // //             <CustomButton 
// // // // // //                     text="Cancel"
// // // // // //                     title = "Cancel" 
// // // // // //                     onPress={cancelPress} 
// // // // // //                 />
// // // // // //         </View>
// // // // // //     );
// // // // // // };



// // // // // // export default NewGroup;

// // // // // // // import React from 'react';
// // // // // // // import { View, Text, StyleSheet, Button } from 'react-native';
// // // // // // // import { useNavigation } from '@react-navigation/native';
// // // // // // // import { auth, db, storage } from '../../../firebaseConfig';
// // // // // // // import { useState, useEffect } from 'react';
// // // // // // // import { doc, setDoc, getDoc } from 'firebase/firestore';
// // // // // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // // // // import { CommonActions } from '@react-navigation/native';
// // // // // // // import CustomInput from '../../components/CustomInput';
// // // // // // // import CustomButton from '../../components/CustomButton';
// // // // // // // import Contacts from 'react-native-contacts';
// // // // // // // import communityLogo from '../../../assets/images/communLogo.jpg'

// // // // // // // const NewGroup = () => {
// // // // // // //         const [groupName, setGroupName] = useState('');
// // // // // // //         const [groupDescription, setGroupDescription] = useState('');
// // // // // // //         const [groupImage, setGroupImage] = useState(null);
    
// // // // // // //         const user = auth.currentUser;
// // // // // // //         const uId = user.uid;
    
// // // // // // //         const navigation = useNavigation();
    
// // // // // // //         const handleSave = async () => {
// // // // // // //             if (!groupName) {
// // // // // // //                 Alert.alert('Error', 'Group Name is required');
// // // // // // //                 return;
// // // // // // //             }
    
// // // // // // //             const groupId = uuidv4();
// // // // // // //             const groupData = {
// // // // // // //                 groupName,
// // // // // // //                 desc: groupDescription,
// // // // // // //                 groupAdmins: [uId],
// // // // // // //                 participants: [uId],
// // // // // // //                 groupImage: groupImage ? groupImage : ''
// // // // // // //             };
    
// // // // // // //             try {
// // // // // // //                 await setDoc(doc(db, 'groups', groupId), groupData);
// // // // // // //                 Alert.alert('Success', 'Group created successfully');
// // // // // // //                 navigation.dispatch(CommonActions.reset({
// // // // // // //                     index: 0,
// // // // // // //                     routes: [{ name: 'homeScreen' }],
// // // // // // //                 }));
// // // // // // //             } catch (error) {
// // // // // // //                 console.log('Error creating group:', error);
// // // // // // //                 Alert.alert('Error', 'Failed to create group');
// // // // // // //             }
// // // // // // //         };
    
// // // // // // //         const cancelPress = () => {
// // // // // // //             navigation.dispatch(CommonActions.reset({
// // // // // // //                 index: 0,
// // // // // // //                 routes: [{ name: 'homeScreen' }],
// // // // // // //             }));
// // // // // // //         };
    
// // // // // // //         const handleImageUpload = (imageUrl) => {
// // // // // // //             setGroupImage(imageUrl);
// // // // // // //         };
    
// // // // // // //         return (
// // // // // // //             <View style={styles.container}>
// // // // // // //                 <UploadPhoto onImageUpload={handleImageUpload} />
// // // // // // //                 <CustomInput
// // // // // // //                     label="Group Name"
// // // // // // //                     value={groupName}
// // // // // // //                     onChangeText={setGroupName}
// // // // // // //                     placeholder="Enter group name"
// // // // // // //                 />
// // // // // // //                 <CustomInput
// // // // // // //                     label="Group Description"
// // // // // // //                     value={groupDescription}
// // // // // // //                     onChangeText={setGroupDescription}
// // // // // // //                     placeholder="Enter group description"
// // // // // // //                 />
// // // // // // //                 <CustomButton 
// // // // // // //                     title="Save" 
// // // // // // //                     text="Save"
// // // // // // //                     onPress={handleSave} 

// // // // // // //                 />
                
// // // // // // //                 <CustomButton 
// // // // // // //                     title="Cancel" 
// // // // // // //                     text = "Cancel"
// // // // // // //                     onPress={cancelPress} />
// // // // // // //             </View>
// // // // // // //         );
// // // // // // //     };
    
// // // // // // // // const NewGroup = () => {

// // // // // // // //     const [groupName, setGroupName] = useState('');
// // // // // // // //     const [groupDescription, setGroupDescription] = useState('');
// // // // // // // //     const user = auth.currentUser;
// // // // // // // //     uId = user.uid;

// // // // // // // //     const navigation = useNavigation();
// // // // // // // //     const ContactsPress = () => {
// // // // // // // //         console.log("Contacts Pressed");
// // // // // // // //     }
    

// // // // // // // //     const handleSave = () => {
// // // // // // // //         console.log("Save Pressed");
// // // // // // // //     }

// // // // // // // //     const cancelPress = () => {
// // // // // // // //         navigation.dispatch(CommonActions.reset({
// // // // // // // //             index: 0,
// // // // // // // //             routes: [
// // // // // // // //                 { name: 'homeScreen' }
// // // // // // // //             ],
// // // // // // // //         }));
// // // // // // // //     };


// // // // // // // //     return (
// // // // // // // //         <View style={styles.container}>
// // // // // // // //             <UploadPhoto/>

// // // // // // // //         <CustomInput
// // // // // // // //             placeholder = "Group Name"
// // // // // // // //         />
// // // // // // // //         <CustomInput
// // // // // // // //             placeholder="Group Description"
// // // // // // // //         />

// // // // // // // //         <CustomButton
// // // // // // // //             text = "Choose Contacts"
// // // // // // // //             onPress={ContactsPress}
// // // // // // // //         />  

// // // // // // // //         <CustomButton
// // // // // // // //             title = "Save"
// // // // // // // //             onPress={handleSave}
// // // // // // // //             text="Save"
// // // // // // // //         />
        
// // // // // // // //         <CustomButton
// // // // // // // //             title = "Return"
// // // // // // // //             onPress={cancelPress}
// // // // // // // //             text="Cancel"
// // // // // // // //             type="SECONDARY"
// // // // // // // //                 />
// // // // // // // //         </View>
// // // // // // // //     );
// // // // // // // // };

// // // // // // const styles = StyleSheet.create({
// // // // // //     container: {
// // // // // //         flex: 1,
// // // // // //         alignItems: 'center',
// // // // // //         paddingTop: 20,
// // // // // //         backgroundColor: '#fff',
// // // // // //     },
// // // // // //     title: {
// // // // // //         fontSize: 24,
// // // // // //         fontWeight: 'bold',
// // // // // //         marginBottom: 16,
// // // // // //     },
// // // // // //     subtitle: {
// // // // // //         fontSize: 18,
// // // // // //         color: '#888',
// // // // // //     },
// // // // // // });

// // // // // // // export default NewGroup;



// // // // // // // // import React, { useState } from 'react';
// // // // // // // // import { View, Text, StyleSheet, Alert } from 'react-native';
// // // // // // // // import { useNavigation } from '@react-navigation/native';
// // // // // // // // import { auth, db } from '../../../firebaseConfig';
// // // // // // // // import { doc, setDoc } from 'firebase/firestore';
// // // // // // // // import { CommonActions } from '@react-navigation/native';
// // // // // // // // import CustomInput from '../../components/CustomInput';
// // // // // // // // import CustomButton from '../../components/CustomButton';
// // // // // // // // import UploadPhoto from '../../components/UploadImage/UploadImage';
// // // // // // // // import { v4 as uuidv4 } from 'uuid';

// // // // // // // // const NewGroup = () => {
// // // // // // // //     const [groupName, setGroupName] = useState('');
// // // // // // // //     const [groupDescription, setGroupDescription] = useState('');
// // // // // // // //     const [groupImage, setGroupImage] = useState(null);

// // // // // // // //     const user = auth.currentUser;
// // // // // // // //     const uId = user.uid;

// // // // // // // //     const navigation = useNavigation();

// // // // // // // //     const handleSave = async () => {
// // // // // // // //         if (!groupName) {
// // // // // // // //             Alert.alert('Error', 'Group Name is required');
// // // // // // // //             return;
// // // // // // // //         }

// // // // // // // //         const groupId = uuidv4();
// // // // // // // //         const groupData = {
// // // // // // // //             groupName,
// // // // // // // //             desc: groupDescription,
// // // // // // // //             groupAdmins: [uId],
// // // // // // // //             participants: [uId],
// // // // // // // //             groupImage: groupImage ? groupImage : ''
// // // // // // // //         };

// // // // // // // //         try {
// // // // // // // //             await setDoc(doc(db, 'groups', groupId), groupData);
// // // // // // // //             Alert.alert('Success', 'Group created successfully');
// // // // // // // //             navigation.dispatch(CommonActions.reset({
// // // // // // // //                 index: 0,
// // // // // // // //                 routes: [{ name: 'homeScreen' }],
// // // // // // // //             }));
// // // // // // // //         } catch (error) {
// // // // // // // //             console.log('Error creating group:', error);
// // // // // // // //             Alert.alert('Error', 'Failed to create group');
// // // // // // // //         }
// // // // // // // //     };

// // // // // // // //     const cancelPress = () => {
// // // // // // // //         navigation.dispatch(CommonActions.reset({
// // // // // // // //             index: 0,
// // // // // // // //             routes: [{ name: 'homeScreen' }],
// // // // // // // //         }));
// // // // // // // //     };

// // // // // // // //     const handleImageUpload = (imageUrl) => {
// // // // // // // //         setGroupImage(imageUrl);
// // // // // // // //     };

// // // // // // // //     return (
// // // // // // // //         <View style={styles.container}>
// // // // // // // //             <UploadPhoto onImageUpload={handleImageUpload} />
// // // // // // // //             <CustomInput
// // // // // // // //                 label="Group Name"
// // // // // // // //                 value={groupName}
// // // // // // // //                 onChangeText={setGroupName}
// // // // // // // //                 placeholder="Enter group name"
// // // // // // // //             />
// // // // // // // //             <CustomInput
// // // // // // // //                 label="Group Description"
// // // // // // // //                 value={groupDescription}
// // // // // // // //                 onChangeText={setGroupDescription}
// // // // // // // //                 placeholder="Enter group description"
// // // // // // // //             />
// // // // // // // //             <CustomButton title="Save" onPress={handleSave} />
// // // // // // // //             <CustomButton title="Cancel" onPress={cancelPress} />
// // // // // // // //         </View>
// // // // // // // //     );
// // // // // // // // };

// // // // // // // // const styles = StyleSheet.create({
// // // // // // // //     container: {
// // // // // // // //         flex: 1,
// // // // // // // //         padding: 20,
// // // // // // // //     },
// // // // // // // // });

// // // // // // // // export default NewGroup;
