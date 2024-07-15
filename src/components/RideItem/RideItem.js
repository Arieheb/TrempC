import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import profile from '../../../assets/images/profile.png';

const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments, profilePicUrl }) => {
    const profileImage = profilePicUrl ? { uri: profilePicUrl } : profile;

    return (
        <View style={styles.container}>
            <Image source={profileImage} style={styles.profileImage} />
            <View style={styles.infoContainer}>
                <Text style={styles.text}>{fullName} has offered a ride!</Text>
                <View style={styles.row}>
                    <Text style={styles.box}>From: {fromLocation}</Text>
                    <Text style={styles.box}>To: {toLocation}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.box}>{date}</Text>
                    <Text style={styles.box}>{time}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.box}>Cost: {cost}</Text>
                    <Text style={styles.box}>Vacant Places: {vacantPlaces}</Text>
                </View>
                <Text style={styles.comments}>Comments: {comments}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginVertical: 5,
        width: '95%',
        borderColor: 'lightblue',
        borderWidth: 3, 
    },
    profileImage: {
        width: 80,
        height: 140,
        borderRadius: 20,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    box: {
        flex: 1,
        backgroundColor: '#e0e0e0',
        padding: 5,
        margin: 3,
        borderRadius: 5,
        textAlign: 'center',
    },
    comments: {
        fontStyle: 'italic',
    },
});

export default RideItem;

// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import profile from '../../../assets/images/profile.png';
// import { storage } from '../../../firebaseConfig';
// import { getDownloadURL, ref } from 'firebase/storage';

// const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments, userEmail }) => {
//     const [profileImage, setProfileImage] = useState(profile);

//     useEffect(() => {
//         const fetchProfileImage = async () => {
//             try {
//                 const profileImageRef = ref(storage, `profile/${userEmail}`);
//                 const url = await getDownloadURL(profileImageRef);
//                 setProfileImage({ uri: url });
//             } catch (error) {
//                 console.log('No profile image found, using default image');
//             }
//         };

//         fetchProfileImage();
//     }, [userEmail]);

//     return (
//         <View style={styles.container}>
//             <Image source={profileImage} style={styles.profileImage} />
//             <View style={styles.infoContainer}>
//                 <Text style={styles.text}>{fullName} has offered a ride!</Text>
//                 <View style={styles.row}>
//                     <Text style={styles.box}>From: {fromLocation}</Text>
//                     <Text style={styles.box}>To: {toLocation}</Text>
//                 </View>
//                 <View style={styles.row}>
//                     <Text style={styles.box}>{date}</Text>
//                     <Text style={styles.box}>{time}</Text>
//                 </View>
//                 <View style={styles.row}>
//                     <Text style={styles.box}>Cost: {cost}</Text>
//                     <Text style={styles.box}>Vacant Places: {vacantPlaces}</Text>
//                 </View>
//                 <Text style={styles.comments}>Comments: {comments}</Text>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#f9f9f9',
//         borderRadius: 10,
//         marginVertical: 5,
//         width: '95%',
//         borderColor: 'lightblue',
//         borderWidth: 3, 
//     },
//     profileImage: {
//         width: 80,
//         height: 80,
//         borderRadius: 50,
//         marginRight: 10,
//     },
//     infoContainer: {
//         flex: 1,
//     },
//     text: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     row: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 5,
//     },
//     box: {
//         flex: 1,
//         backgroundColor: '#e0e0e0',
//         padding: 5,
//         margin: 3,
//         borderRadius: 5,
//         textAlign: 'center',
//     },
//     comments: {
//         fontStyle: 'italic',
//     },
// });

// export default RideItem;

// // import React, { useEffect, useState } from 'react';
// // import { View, Text, Image, StyleSheet } from 'react-native';
// // import profile from '../../../assets/images/profile.png';
// // import { storage } from '../../../firebaseConfig';
// // import { getDownloadURL, ref } from 'firebase/storage';

// // const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments, userEmail }) => {
// //     const [profileImage, setProfileImage] = useState(profile);

// //     useEffect(() => {
// //         const fetchProfileImage = async () => {
// //             try {
// //                 const profileImageRef = ref(storage, `profile/${userEmail}`);
// //                 const url = await getDownloadURL(profileImageRef);
// //                 setProfileImage({ uri: url });
// //             } catch (error) {
// //                 console.log('No profile image found, using default image');
// //             }
// //         };

// //         fetchProfileImage();
// //     }, [userEmail]);

// //     return (
// //         <View style={styles.container}>
// //             <Image source={profileImage} style={styles.profileImage} />
// //             <View style={styles.infoContainer}>
// //                 <Text style={styles.text}>{fullName} has offered a ride!</Text>
// //                 <View style={styles.row}>
// //                     <Text style={styles.box}>From: {fromLocation}</Text>
// //                     <Text style={styles.box}>To: {toLocation}</Text>
// //                 </View>
// //                 <View style={styles.row}>
// //                     <Text style={styles.box}>{date}</Text>
// //                     <Text style={styles.box}>{time}</Text>
// //                 </View>
// //                 <View style={styles.row}>
// //                     <Text style={styles.box}>Cost: {cost}</Text>
// //                     <Text style={styles.box}>Vacant Places: {vacantPlaces}</Text>
// //                 </View>
// //                 <Text style={styles.comments}>Comments: {comments}</Text>
// //             </View>
// //         </View>
// //     );
// // };

// // const styles = StyleSheet.create({
// //     container: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         padding: 10,
// //         backgroundColor: '#f9f9f9',
// //         borderRadius: 10,
// //         marginVertical: 5,
// //         width: '95%',
// //         borderColor: 'lightblue',
// //         borderWidth: 3, 
// //     },
// //     profileImage: {
// //         width: 80,
// //         height: 80,
// //         borderRadius: 50,
// //         marginRight: 10,
// //     },
// //     infoContainer: {
// //         flex: 1,
// //     },
// //     text: {
// //         fontSize: 16,
// //         fontWeight: 'bold',
// //         marginBottom: 5,
// //     },
// //     row: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         marginBottom: 5,
// //     },
// //     box: {
// //         flex: 1,
// //         backgroundColor: '#e0e0e0',
// //         padding: 5,
// //         margin: 3,
// //         borderRadius: 5,
// //         textAlign: 'center',
// //     },
// //     comments: {
// //         fontStyle: 'italic',
// //     },
// // });

// // export default RideItem;

// // // import React, { useEffect, useState } from 'react';
// // // import { View, Text, Image, StyleSheet } from 'react-native';
// // // import profile from '../../../assets/images/profile.png';
// // // import { storage } from '../../../firebaseConfig';

// // // const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments, userEmail }) => {
// // //     const [profileImage, setProfileImage] = useState(profile);

// // //     useEffect(() => {
// // //         const fetchProfileImage = async () => {
// // //             try {
// // //                 const profileImageRef = storage.ref(`profile/${userEmail}`);
// // //                 const url = await profileImageRef.getDownloadURL();
// // //                 setProfileImage({ uri: url });
// // //             } catch (error) {
// // //                 console.log('No profile image found, using default image');
// // //             }
// // //         };

// // //         fetchProfileImage();
// // //     }, [userEmail]);

// // //     return (
// // //         <View style={styles.container}>
// // //             <Image source={profileImage} style={styles.profileImage} />
// // //             <View style={styles.infoContainer}>
// // //                 <Text style={styles.text}>{fullName} has offered a ride!</Text>
// // //                 <View style={styles.row}>
// // //                     <Text style={styles.box}>From: {fromLocation}</Text>
// // //                     <Text style={styles.box}>To: {toLocation}</Text>
// // //                 </View>
// // //                 <View style={styles.row}>
// // //                     <Text style={styles.box}>{date}</Text>
// // //                     <Text style={styles.box}>{time}</Text>
// // //                 </View>
// // //                 <View style={styles.row}>
// // //                     <Text style={styles.box}>Cost: {cost}</Text>
// // //                     <Text style={styles.box}>Vacant Places: {vacantPlaces}</Text>
// // //                 </View>
// // //                 <Text style={styles.comments}>Comments: {comments}</Text>
// // //             </View>
// // //         </View>
// // //     );
// // // };

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         padding: 10,
// // //         backgroundColor: '#f9f9f9',
// // //         borderRadius: 10,
// // //         marginVertical: 5,
// // //         width: '95%',
// // //         borderColor: 'lightblue',
// // //         borderWidth: 3, 
// // //     },
// // //     profileImage: {
// // //         width: 80,
// // //         height: 80,
// // //         borderRadius: 50,
// // //         marginRight: 10,
// // //     },
// // //     infoContainer: {
// // //         flex: 1,
// // //     },
// // //     text: {
// // //         fontSize: 16,
// // //         fontWeight: 'bold',
// // //         marginBottom: 5,
// // //     },
// // //     row: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'space-between',
// // //         marginBottom: 5,
// // //     },
// // //     box: {
// // //         flex: 1,
// // //         backgroundColor: '#e0e0e0',
// // //         padding: 5,
// // //         margin: 3,
// // //         borderRadius: 5,
// // //         textAlign: 'center',
// // //     },
// // //     comments: {
// // //         fontStyle: 'italic',
// // //     },
// // // });

// // // export default RideItem;

// // // // import React from 'react';
// // // // import { View, Text, Image, StyleSheet } from 'react-native';
// // // // import profile from '../../../assets/images/profile.png';

// // // // const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments }) => {
// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <Image source={profile} style={styles.profileImage} />
// // // //       <View style={styles.infoContainer}>
// // // //         <Text style={styles.text}>{fullName} has offered a ride!</Text>
// // // //         <View style={styles.row}>
// // // //           <Text style={styles.box}>From: {fromLocation}</Text>
// // // //           <Text style={styles.box}>To: {toLocation}</Text>
// // // //         </View>
// // // //         <View style={styles.row}>
// // // //           <Text style={styles.box}>{date}</Text>
// // // //           <Text style={styles.box}>{time}</Text>
// // // //         </View>
// // // //         <View style={styles.row}>
// // // //           <Text style={styles.box}>Cost: {cost}</Text>
// // // //           <Text style={styles.box}>Vacant Places: {vacantPlaces}</Text>
// // // //         </View>
// // // //         <Text style={styles.comments}>Comments: {comments}</Text>
// // // //       </View>
// // // //     </View>
// // // //   );
// // // // };

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     padding: 10,
// // // //     backgroundColor: '#f9f9f9',
// // // //     borderRadius: 10,
// // // //     marginVertical: 5,
// // // //     width: '95%',
// // // //     borderColor: 'lightblue',
// // // //     borderWidth: 3, 
// // // //   },
// // // //   profileImage: {
// // // //     width: 80,
// // // //     height: 80,
// // // //     borderRadius: 50,
// // // //     marginRight: 10,
// // // //   },
// // // //   infoContainer: {
// // // //     flex: 1,
// // // //   },
// // // //   text: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //     marginBottom: 5,
// // // //   },
// // // //   row: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     marginBottom: 5,
// // // //   },
// // // //   box: {
// // // //     flex: 1,
// // // //     backgroundColor: '#e0e0e0',
// // // //     padding: 5,
// // // //     margin: 3,
// // // //     borderRadius: 5,
// // // //     textAlign: 'center',
// // // //   },
// // // //   comments: {
// // // //     fontStyle: 'italic',
// // // //   },
// // // // });

// // // // export default RideItem;
