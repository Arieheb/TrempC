import React, { useCallback } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from './UserContext';
import { getDownloadURL, ref } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { storage, db } from './firebaseConfig';

const CustomDrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.itemContent}>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default function CustomDrawerContent({ navigation, ...props }) {
  const { userProfile, setUserProfile } = useUser();

  useFocusEffect(
    useCallback(() => {
      const fetchProfileData = async () => {
        const user = auth.currentUser;
        if (user) {
          const email = user.email.toLowerCase();
          const profilePicRef = ref(storage, `profile/${email}`);

          try {
            const url = await getDownloadURL(profilePicRef);
            setUserProfile((prevState) => ({ ...prevState, profilePicture: url }));
          } catch {
            setUserProfile((prevState) => ({ ...prevState, profilePicture: require('./assets/images/profile.png') }));
          }

          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const { firstName, lastName } = docSnap.data();
            setUserProfile((prevState) => ({ ...prevState, fullName: `${firstName} ${lastName}` }));
          }
        }
      };

      fetchProfileData();
    }, [setUserProfile])
  );

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
            auth.signOut()
              .then(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'loginScreen' }],
                });
              })
              .catch(error => console.error(error));
          }
        }
      ]
    );
  };

  const drawerItems = [
    { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
    { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
    { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
    { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
  ];

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.drawerContent}>
        <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
          {userProfile.profilePicture && <Image source={typeof userProfile.profilePicture === 'string' ? { uri: userProfile.profilePicture } : userProfile.profilePicture} style={styles.profilePicture} />}
          <Text style={styles.fullName}>{userProfile.fullName}</Text>
        </TouchableOpacity>
        
        {drawerItems.map((item, index) => (
          <CustomDrawerItem
            key={index}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
          />
        ))}
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
        <Button title="Sign Out" onPress={handleSignOut} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    borderWidth: 0,
  },
  drawerItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginRight: 10,
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
});

// import React, { useCallback } from 'react';
// import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// import { DrawerContentScrollView } from '@react-navigation/drawer';
// import { Ionicons } from '@expo/vector-icons';
// import { auth } from './firebaseConfig';
// import { useFocusEffect } from '@react-navigation/native';
// import { useUser } from './UserContext';
// import { getDownloadURL, ref } from 'firebase/storage';
// import { doc, getDoc } from 'firebase/firestore';
// import { storage, db } from './firebaseConfig';

// const CustomDrawerItem = ({ icon, label, onPress }) => (
//   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
//     <View style={styles.itemContent}>
//       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
//       <Text style={styles.label}>{label}</Text>
//     </View>
//   </TouchableOpacity>
// );

// export default function CustomDrawerContent({ navigation, ...props }) {
//   const { userProfile, setUserProfile } = useUser();

//   useFocusEffect(
//     useCallback(() => {
//       const fetchProfileData = async () => {
//         const user = auth.currentUser;
//         if (user) {
//           const email = user.email.toLowerCase();
//           const profilePicRef = ref(storage, `profile/${email}`);

//           try {
//             const url = await getDownloadURL(profilePicRef);
//             setUserProfile((prevState) => ({ ...prevState, profilePicture: url }));
//           } catch {
//             setUserProfile((prevState) => ({ ...prevState, profilePicture: require('./assets/images/profile.png') }));
//           }

//           const userRef = doc(db, 'users', user.uid);
//           const docSnap = await getDoc(userRef);
//           if (docSnap.exists()) {
//             const { firstName, lastName } = docSnap.data();
//             setUserProfile((prevState) => ({ ...prevState, fullName: `${firstName} ${lastName}` }));
//           }
//         }
//       };

//       fetchProfileData();
//     }, [setUserProfile])
//   );

//   const handleSignOut = () => {
//     Alert.alert(
//       "Sign Out",
//       "Are you sure you want to sign out?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         {
//           text: "Yes",
//           onPress: () => {
//             auth.signOut()
//               .then(() => {
//                 navigation.reset({
//                   index: 0,
//                   routes: [{ name: 'loginScreen' }],
//                 });
//               })
//               .catch(error => console.error(error));
//           }
//         }
//       ]
//     );
//   };

//   const drawerItems = [
//     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
//     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
//     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
//     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
//   ];

//   return (
//     <View style={styles.container}>
//       <DrawerContentScrollView {...props} style={styles.drawerContent}>
//         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
//           {userProfile.profilePicture && <Image source={typeof userProfile.profilePicture === 'string' ? { uri: userProfile.profilePicture } : userProfile.profilePicture} style={styles.profilePicture} />}
//           <Text style={styles.fullName}>{userProfile.fullName}</Text>
//         </TouchableOpacity>
        
//         {drawerItems.map((item, index) => (
//           <CustomDrawerItem
//             key={index}
//             icon={item.icon}
//             label={item.label}
//             onPress={item.onPress}
//           />
//         ))}
//       </DrawerContentScrollView>
//       <View style={styles.footer}>
//         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
//         <Button title="Sign Out" onPress={handleSignOut} color="black" />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   drawerContent: {
//     flex: 1,
//     borderWidth: 0,
//   },
//   drawerItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   itemContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 7,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderBottomColor: '#ccc',
//   },
//   profilePicture: {
//     width: 70,
//     height: 70,
//     borderRadius: 50,
//     marginRight: 10,
//   },
//   fullName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'black',
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: '#ccc',
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: 'black',
//     marginLeft: 10,
//   },
// });

// // import React, { useCallback } from 'react';
// // import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// // import { DrawerContentScrollView } from '@react-navigation/drawer';
// // import { Ionicons } from '@expo/vector-icons';
// // import { auth } from './firebaseConfig';
// // import { useFocusEffect } from '@react-navigation/native';
// // import { useUser } from './UserContext';
// // import { getDownloadURL, ref } from 'firebase/storage';
// // import { doc, getDoc } from 'firebase/firestore';
// // import { storage, db } from './firebaseConfig';

// // const CustomDrawerItem = ({ icon, label, onPress }) => (
// //   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
// //     <View style={styles.itemContent}>
// //       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
// //       <Text style={styles.label}>{label}</Text>
// //     </View>
// //   </TouchableOpacity>
// // );

// // export default function CustomDrawerContent({ navigation, ...props }) {
// //   const { userProfile, setUserProfile } = useUser();

// //   useFocusEffect(
// //     useCallback(() => {
// //       const fetchProfileData = async () => {
// //         const user = auth.currentUser;
// //         if (user) {
// //           const email = user.email.toLowerCase();
// //           const profilePicRef = ref(storage, `profile/${email}`);

// //           try {
// //             const url = await getDownloadURL(profilePicRef);
// //             setUserProfile((prevState) => ({ ...prevState, profilePicture: url }));
// //           } catch {
// //             setUserProfile((prevState) => ({ ...prevState, profilePicture: require('./assets/images/profile.png') }));
// //           }

// //           const userRef = doc(db, 'users', user.uid);
// //           const docSnap = await getDoc(userRef);
// //           if (docSnap.exists()) {
// //             const { firstName, lastName } = docSnap.data();
// //             setUserProfile((prevState) => ({ ...prevState, fullName: `${firstName} ${lastName}` }));
// //           }
// //         }
// //       };

// //       fetchProfileData();
// //     }, [setUserProfile])
// //   );

// //   const handleSignOut = () => {
// //     Alert.alert(
// //       "Sign Out",
// //       "Are you sure you want to sign out?",
// //       [
// //         {
// //           text: "Cancel",
// //           style: "cancel"
// //         },
// //         {
// //           text: "Yes",
// //           onPress: () => {
// //             auth.signOut()
// //               .then(() => {
// //                 navigation.reset({
// //                   index: 0,
// //                   routes: [{ name: 'loginScreen' }],
// //                 });
// //               })
// //               .catch(error => console.error(error));
// //           }
// //         }
// //       ]
// //     );
// //   };

// //   const drawerItems = [
// //     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
// //     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
// //     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
// //     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
// //   ];

// //   return (
// //     <View style={styles.container}>
// //       <DrawerContentScrollView {...props} style={styles.drawerContent}>
// //         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
// //           {userProfile.profilePicture && <Image source={typeof userProfile.profilePicture === 'string' ? { uri: userProfile.profilePicture } : userProfile.profilePicture} style={styles.profilePicture} />}
// //           <Text style={styles.fullName}>{userProfile.fullName}</Text>
// //         </TouchableOpacity>
        
// //         {drawerItems.map((item, index) => (
// //           <CustomDrawerItem
// //             key={index}
// //             icon={item.icon}
// //             label={item.label}
// //             onPress={item.onPress}
// //           />
// //         ))}
// //       </DrawerContentScrollView>
// //       <View style={styles.footer}>
// //         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
// //         <Button title="Sign Out" onPress={handleSignOut} color="black" />
// //       </View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //   },
// //   drawerContent: {
// //     flex: 1,
// //     borderWidth: 0,
// //   },
// //   drawerItem: {
// //     paddingVertical: 10,
// //     paddingHorizontal: 20,
// //   },
// //   itemContent: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 7,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingVertical: 20,
// //     paddingHorizontal: 20,
// //     borderBottomWidth: StyleSheet.hairlineWidth,
// //     borderBottomColor: '#ccc',
// //   },
// //   profilePicture: {
// //     width: 70,
// //     height: 70,
// //     borderRadius: 50,
// //     marginRight: 10,
// //   },
// //   fullName: {
// //     fontSize: 18,
// //     fontWeight: 'bold',
// //     color: 'black',
// //   },
// //   footer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     borderTopWidth: StyleSheet.hairlineWidth,
// //     borderTopColor: '#ccc',
// //     paddingVertical: 30,
// //     paddingHorizontal: 20,
// //   },
// //   icon: {
// //     marginRight: 10,
// //   },
// //   label: {
// //     fontSize: 16,
// //     fontWeight: 'bold',
// //     color: 'black',
// //     marginLeft: 10,
// //   },
// // });

// // // import React, { useCallback } from 'react';
// // // import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// // // import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // // import { Ionicons } from '@expo/vector-icons';
// // // import { auth } from './firebaseConfig';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import { useUser } from './UserContext';
// // // import { getDownloadURL, ref } from 'firebase/storage';
// // // import { doc, getDoc } from 'firebase/firestore';
// // // import { db, storage } from './firebaseConfig';

// // // const CustomDrawerItem = ({ icon, label, onPress }) => (
// // //   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
// // //     <View style={styles.itemContent}>
// // //       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
// // //       <Text style={styles.label}>{label}</Text>
// // //     </View>
// // //   </TouchableOpacity>
// // // );

// // // export default function CustomDrawerContent({ navigation, ...props }) {
// // //   const { userProfile, setUserProfile } = useUser();

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       const fetchProfileData = async () => {
// // //         const user = auth.currentUser;
// // //         if (user) {
// // //           const email = user.email.toLowerCase();
// // //           const profilePicRef = ref(storage, `profile/${email}`);

// // //           try {
// // //             const url = await getDownloadURL(profilePicRef);
// // //             setUserProfile((prevState) => ({ ...prevState, profilePicture: url }));
// // //           } catch {
// // //             setUserProfile((prevState) => ({ ...prevState, profilePicture: require('./assets/images/profile.png') }));
// // //           }

// // //           const userRef = doc(db, 'users', user.uid);
// // //           const docSnap = await getDoc(userRef);
// // //           if (docSnap.exists()) {
// // //             const { firstName, lastName } = docSnap.data();
// // //             setUserProfile((prevState) => ({ ...prevState, fullName: `${firstName} ${lastName}` }));
// // //           }
// // //         }
// // //       };

// // //       fetchProfileData();
// // //     }, [setUserProfile])
// // //   );

// // //   const handleSignOut = () => {
// // //     Alert.alert(
// // //       "Sign Out",
// // //       "Are you sure you want to sign out?",
// // //       [
// // //         {
// // //           text: "Cancel",
// // //           style: "cancel"
// // //         },
// // //         {
// // //           text: "Yes",
// // //           onPress: () => {
// // //             auth.signOut()
// // //               .then(() => {
// // //                 navigation.reset({
// // //                   index: 0,
// // //                   routes: [{ name: 'loginScreen' }],
// // //                 });
// // //               })
// // //               .catch(error => console.error(error));
// // //           }
// // //         }
// // //       ]
// // //     );
// // //   };

// // //   const drawerItems = [
// // //     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
// // //     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
// // //     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
// // //     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
// // //   ];

// // //   return (
// // //     <View style={styles.container}>
// // //       <DrawerContentScrollView {...props} style={styles.drawerContent}>
// // //         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
// // //           {userProfile.profilePicture && <Image source={typeof userProfile.profilePicture === 'string' ? { uri: userProfile.profilePicture } : userProfile.profilePicture} style={styles.profilePicture} />}
// // //           <Text style={styles.fullName}>{userProfile.fullName}</Text>
// // //         </TouchableOpacity>
        
// // //         {drawerItems.map((item, index) => (
// // //           <CustomDrawerItem
// // //             key={index}
// // //             icon={item.icon}
// // //             label={item.label}
// // //             onPress={item.onPress}
// // //           />
// // //         ))}
// // //       </DrawerContentScrollView>
// // //       <View style={styles.footer}>
// // //         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
// // //         <Button title="Sign Out" onPress={handleSignOut} color="black" />
// // //       </View>
// // //     </View>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //   },
// // //   drawerContent: {
// // //     flex: 1,
// // //     borderWidth: 0,
// // //   },
// // //   drawerItem: {
// // //     paddingVertical: 10,
// // //     paddingHorizontal: 20,
// // //   },
// // //   itemContent: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingVertical: 7,
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingVertical: 20,
// // //     paddingHorizontal: 20,
// // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // //     borderBottomColor: '#ccc',
// // //   },
// // //   profilePicture: {
// // //     width: 70,
// // //     height: 70,
// // //     borderRadius: 50,
// // //     marginRight: 10,
// // //   },
// // //   fullName: {
// // //     fontSize: 18,
// // //     fontWeight: 'bold',
// // //     color: 'black',
// // //   },
// // //   footer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     borderTopWidth: StyleSheet.hairlineWidth,
// // //     borderTopColor: '#ccc',
// // //     paddingVertical: 30,
// // //     paddingHorizontal: 20,
// // //   },
// // //   icon: {
// // //     marginRight: 10,
// // //   },
// // //   label: {
// // //     fontSize: 16,
// // //     fontWeight: 'bold',
// // //     color: 'black',
// // //     marginLeft: 10,
// // //   },
// // // });

// // // // import React, { useCallback } from 'react';
// // // // import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// // // // import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // // // import { Ionicons } from '@expo/vector-icons';
// // // // import { auth } from './firebaseConfig';
// // // // import { useFocusEffect } from '@react-navigation/native';
// // // // import { useUser } from './UserContext';
// // // // import { getDownloadURL, ref } from 'firebase/storage';
// // // // import { doc, getDoc } from 'firebase/firestore';
// // // // import { db, storage } from './firebaseConfig';

// // // // const CustomDrawerItem = ({ icon, label, onPress }) => (
// // // //   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
// // // //     <View style={styles.itemContent}>
// // // //       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
// // // //       <Text style={styles.label}>{label}</Text>
// // // //     </View>
// // // //   </TouchableOpacity>
// // // // );

// // // // export default function CustomDrawerContent({ navigation, ...props }) {
// // // //   const { userProfile, setUserProfile } = useUser();

// // // //   useFocusEffect(
// // // //     useCallback(() => {
// // // //       const fetchProfileData = async () => {
// // // //         const user = auth.currentUser;
// // // //         if (user) {
// // // //           const email = user.email.toLowerCase();
// // // //           const profilePicRef = ref(storage, `profile/${email}`);

// // // //           try {
// // // //             const url = await getDownloadURL(profilePicRef);
// // // //             setUserProfile((prevState) => ({ ...prevState, profilePicture: url }));
// // // //           } catch {
// // // //             setUserProfile((prevState) => ({ ...prevState, profilePicture: require('./assets/images/profile.png') }));
// // // //           }

// // // //           const userRef = doc(db, 'users', user.uid);
// // // //           const docSnap = await getDoc(userRef);
// // // //           if (docSnap.exists()) {
// // // //             const { firstName, lastName } = docSnap.data();
// // // //             setUserProfile((prevState) => ({ ...prevState, fullName: `${firstName} ${lastName}` }));
// // // //           }
// // // //         }
// // // //       };

// // // //       fetchProfileData();
// // // //     }, [setUserProfile])
// // // //   );

// // // //   const handleSignOut = () => {
// // // //     Alert.alert(
// // // //       "Sign Out",
// // // //       "Are you sure you want to sign out?",
// // // //       [
// // // //         {
// // // //           text: "Cancel",
// // // //           style: "cancel"
// // // //         },
// // // //         {
// // // //           text: "Yes",
// // // //           onPress: () => {
// // // //             auth.signOut()
// // // //               .then(() => {
// // // //                 navigation.reset({
// // // //                   index: 0,
// // // //                   routes: [{ name: 'loginScreen' }],
// // // //                 });
// // // //               })
// // // //               .catch(error => console.error(error));
// // // //           }
// // // //         }
// // // //       ]
// // // //     );
// // // //   };

// // // //   const drawerItems = [
// // // //     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
// // // //     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
// // // //     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
// // // //     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
// // // //   ];

// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <DrawerContentScrollView {...props} style={styles.drawerContent}>
// // // //         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
// // // //           {userProfile.profilePicture && <Image source={typeof userProfile.profilePicture === 'string' ? { uri: userProfile.profilePicture } : userProfile.profilePicture} style={styles.profilePicture} />}
// // // //           <Text style={styles.fullName}>{userProfile.fullName}</Text>
// // // //         </TouchableOpacity>
        
// // // //         {drawerItems.map((item, index) => (
// // // //           <CustomDrawerItem
// // // //             key={index}
// // // //             icon={item.icon}
// // // //             label={item.label}
// // // //             onPress={item.onPress}
// // // //           />
// // // //         ))}
// // // //       </DrawerContentScrollView>
// // // //       <View style={styles.footer}>
// // // //         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
// // // //         <Button title="Sign Out" onPress={handleSignOut} color="black" />
// // // //       </View>
// // // //     </View>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //   },
// // // //   drawerContent: {
// // // //     flex: 1,
// // // //     borderWidth: 0,
// // // //   },
// // // //   drawerItem: {
// // // //     paddingVertical: 10,
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   itemContent: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     paddingVertical: 7,
// // // //   },
// // // //   header: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     paddingVertical: 20,
// // // //     paddingHorizontal: 20,
// // // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // // //     borderBottomColor: '#ccc',
// // // //   },
// // // //   profilePicture: {
// // // //     width: 70,
// // // //     height: 70,
// // // //     borderRadius: 50,
// // // //     marginRight: 10,
// // // //   },
// // // //   fullName: {
// // // //     fontSize: 18,
// // // //     fontWeight: 'bold',
// // // //     color: 'black',
// // // //   },
// // // //   footer: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     borderTopWidth: StyleSheet.hairlineWidth,
// // // //     borderTopColor: '#ccc',
// // // //     paddingVertical: 30,
// // // //     paddingHorizontal: 20,
// // // //   },
// // // //   icon: {
// // // //     marginRight: 10,
// // // //   },
// // // //   label: {
// // // //     fontSize: 16,
// // // //     fontWeight: 'bold',
// // // //     color: 'black',
// // // //     marginLeft: 10,
// // // //   },
// // // // });

// // // // // import React, { useEffect, useState, useCallback } from 'react';
// // // // // import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// // // // // import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // // // // import { Ionicons } from '@expo/vector-icons';
// // // // // import { auth, db, storage } from './firebaseConfig';
// // // // // import { getDownloadURL, ref } from 'firebase/storage';
// // // // // import { doc, getDoc } from 'firebase/firestore';
// // // // // import { useFocusEffect } from '@react-navigation/native';

// // // // // const CustomDrawerItem = ({ icon, label, onPress }) => (
// // // // //   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
// // // // //     <View style={styles.itemContent}>
// // // // //       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
// // // // //       <Text style={styles.label}>{label}</Text>
// // // // //     </View>
// // // // //   </TouchableOpacity>
// // // // // );

// // // // // export default function CustomDrawerContent({ navigation, ...props }) {
// // // // //   const [profilePicture, setProfilePicture] = useState(null);
// // // // //   const [fullName, setFullName] = useState('');

// // // // //   const fetchProfileData = useCallback(() => {
// // // // //     const user = auth.currentUser;
// // // // //     if (user) {
// // // // //       const email = user.email.toLowerCase();
// // // // //       const profilePicRef = ref(storage, `profile/${email}`);

// // // // //       getDownloadURL(profilePicRef)
// // // // //         .then(url => setProfilePicture(url))
// // // // //         .catch(() => {
// // // // //           setProfilePicture(require('./assets/images/profile.png'));
// // // // //         });

// // // // //       const userRef = doc(db, 'users', user.uid);
// // // // //       getDoc(userRef)
// // // // //         .then(docSnap => {
// // // // //           if (docSnap.exists()) {
// // // // //             const { firstName, lastName } = docSnap.data();
// // // // //             setFullName(`${firstName} ${lastName}`);
// // // // //           } else {
// // // // //             console.log('No such document!');
// // // // //           }
// // // // //         })
// // // // //         .catch(error => console.error('Error fetching user data:', error));
// // // // //     }
// // // // //   }, []);

// // // // //   useFocusEffect(
// // // // //     useCallback(() => {
// // // // //       fetchProfileData();
// // // // //     }, [fetchProfileData])
// // // // //   );

// // // // //   const handleSignOut = () => {
// // // // //     Alert.alert(
// // // // //       "Sign Out",
// // // // //       "Are you sure you want to sign out?",
// // // // //       [
// // // // //         {
// // // // //           text: "Cancel",
// // // // //           style: "cancel"
// // // // //         },
// // // // //         {
// // // // //           text: "Yes",
// // // // //           onPress: () => {
// // // // //             auth.signOut()
// // // // //               .then(() => {
// // // // //                 navigation.reset({
// // // // //                   index: 0,
// // // // //                   routes: [{ name: 'loginScreen' }],
// // // // //                 });
// // // // //               })
// // // // //               .catch(error => console.error(error));
// // // // //           }
// // // // //         }
// // // // //       ]
// // // // //     );
// // // // //   };

// // // // //   const drawerItems = [
// // // // //     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
// // // // //     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
// // // // //     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
// // // // //     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
// // // // //   ];

// // // // //   return (
// // // // //     <View style={styles.container}>
// // // // //       <DrawerContentScrollView {...props} style={styles.drawerContent}>
// // // // //         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
// // // // //           {profilePicture && <Image source={typeof profilePicture === 'string' ? { uri: profilePicture } : profilePicture} style={styles.profilePicture} />}
// // // // //           <Text style={styles.fullName}>{fullName}</Text>
// // // // //         </TouchableOpacity>
        
// // // // //         {drawerItems.map((item, index) => (
// // // // //           <CustomDrawerItem
// // // // //             key={index}
// // // // //             icon={item.icon}
// // // // //             label={item.label}
// // // // //             onPress={item.onPress}
// // // // //           />
// // // // //         ))}
// // // // //       </DrawerContentScrollView>
// // // // //       <View style={styles.footer}>
// // // // //         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
// // // // //         <Button title="Sign Out" onPress={handleSignOut} color="black" />
// // // // //       </View>
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   container: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   drawerContent: {
// // // // //     flex: 1,
// // // // //     borderWidth: 0,
// // // // //   },
// // // // //   drawerItem: {
// // // // //     paddingVertical: 10,
// // // // //     paddingHorizontal: 20,
// // // // //   },
// // // // //   itemContent: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     paddingVertical: 7,
// // // // //   },
// // // // //   header: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     paddingVertical: 20,
// // // // //     paddingHorizontal: 20,
// // // // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // // // //     borderBottomColor: '#ccc',
// // // // //   },
// // // // //   profilePicture: {
// // // // //     width: 70,
// // // // //     height: 70,
// // // // //     borderRadius: 50,
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   fullName: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: 'bold',
// // // // //     color: 'black',
// // // // //   },
// // // // //   footer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     borderTopWidth: StyleSheet.hairlineWidth,
// // // // //     borderTopColor: '#ccc',
// // // // //     paddingVertical: 30,
// // // // //     paddingHorizontal: 20,
// // // // //   },
// // // // //   icon: {
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   label: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: 'bold',
// // // // //     color: 'black',
// // // // //     marginLeft: 10,
// // // // //   },
// // // // // });

// // // // // // import React, { useEffect, useState } from 'react';
// // // // // // import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
// // // // // // import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // // // // // import { Ionicons } from '@expo/vector-icons';
// // // // // // import { auth, db, storage } from './firebaseConfig';
// // // // // // import { getDownloadURL, ref } from 'firebase/storage';
// // // // // // import { doc, getDoc } from 'firebase/firestore';

// // // // // // const CustomDrawerItem = ({ icon, label, onPress }) => (
// // // // // //   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
// // // // // //     <View style={styles.itemContent}>
// // // // // //       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
// // // // // //       <Text style={styles.label}>{label}</Text>
// // // // // //     </View>
// // // // // //   </TouchableOpacity>
// // // // // // );

// // // // // // export default function CustomDrawerContent({ navigation, ...props }) {
// // // // // //   const [profilePicture, setProfilePicture] = useState(null);
// // // // // //   const [fullName, setFullName] = useState('');

// // // // // //   useEffect(() => {
// // // // // //     const user = auth.currentUser;
// // // // // //     if (user) {
// // // // // //       const email = user.email.toLowerCase();
// // // // // //       const profilePicRef = ref(storage, `profile/${email}`);

// // // // // //       getDownloadURL(profilePicRef)
// // // // // //         .then(url => setProfilePicture(url))
// // // // // //         .catch(() => {
// // // // // //           setProfilePicture(require('./assets/images/profile.png'));
// // // // // //         });

// // // // // //       const userRef = doc(db, 'users', user.uid);
// // // // // //       getDoc(userRef)
// // // // // //         .then(docSnap => {
// // // // // //           if (docSnap.exists()) {
// // // // // //             const { firstName, lastName } = docSnap.data();
// // // // // //             setFullName(`${firstName} ${lastName}`);
// // // // // //           } else {
// // // // // //             console.log('No such document!');
// // // // // //           }
// // // // // //         })
// // // // // //         .catch(error => console.error('Error fetching user data:', error));
// // // // // //     }
// // // // // //   }, []);

// // // // // //   const handleSignOut = () => {
// // // // // //     Alert.alert(
// // // // // //       "Sign Out",
// // // // // //       "Are you sure you want to sign out?",
// // // // // //       [
// // // // // //         {
// // // // // //           text: "Cancel",
// // // // // //           style: "cancel"
// // // // // //         },
// // // // // //         {
// // // // // //           text: "Yes",
// // // // // //           onPress: () => {
// // // // // //             auth.signOut()
// // // // // //               .then(() => {
// // // // // //                 navigation.reset({
// // // // // //                   index: 0,
// // // // // //                   routes: [{ name: 'loginScreen' }],
// // // // // //                 });
// // // // // //               })
// // // // // //               .catch(error => console.error(error));
// // // // // //           }
// // // // // //         }
// // // // // //       ]
// // // // // //     );
// // // // // //   };

// // // // // //   const drawerItems = [
// // // // // //     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
// // // // // //     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
// // // // // //     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
// // // // // //     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
// // // // // //   ];

// // // // // //   return (
// // // // // //     <View style={styles.container}>
// // // // // //       <DrawerContentScrollView {...props} style={styles.drawerContent}>
// // // // // //         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
// // // // // //           {profilePicture && <Image source={typeof profilePicture === 'string' ? { uri: profilePicture } : profilePicture} style={styles.profilePicture} />}
// // // // // //           <Text style={styles.fullName}>{fullName}</Text>
// // // // // //         </TouchableOpacity>
        
// // // // // //         {drawerItems.map((item, index) => (
// // // // // //           <CustomDrawerItem
// // // // // //             key={index}
// // // // // //             icon={item.icon}
// // // // // //             label={item.label}
// // // // // //             onPress={item.onPress}
// // // // // //           />
// // // // // //         ))}
// // // // // //       </DrawerContentScrollView>
// // // // // //       <View style={styles.footer}>
// // // // // //         <Ionicons name="exit-outline" size={24} color="black" style={styles.icon} />
// // // // // //         <Button title="Sign Out" onPress={handleSignOut} color="black" />
// // // // // //       </View>
// // // // // //     </View>
// // // // // //   );
// // // // // // }

// // // // // // const styles = StyleSheet.create({
// // // // // //   container: {
// // // // // //     flex: 1,
// // // // // //   },
// // // // // //   drawerContent: {
// // // // // //     flex: 1,
// // // // // //     borderWidth: 0,
// // // // // //   },
// // // // // //   drawerItem: {
// // // // // //     paddingVertical: 10,
// // // // // //     paddingHorizontal: 20,
// // // // // //   },
// // // // // //   itemContent: {
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //     paddingVertical: 7,
// // // // // //   },
// // // // // //   header: {
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //     paddingVertical: 20,
// // // // // //     paddingHorizontal: 20,
// // // // // //     borderBottomWidth: StyleSheet.hairlineWidth,
// // // // // //     borderBottomColor: '#ccc',
// // // // // //   },
// // // // // //   profilePicture: {
// // // // // //     width: 70,
// // // // // //     height: 70,
// // // // // //     borderRadius: 50,
// // // // // //     marginRight: 10,
// // // // // //   },
// // // // // //   fullName: {
// // // // // //     fontSize: 18,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: 'black',
// // // // // //   },
// // // // // //   footer: {
// // // // // //     flexDirection: 'row',
// // // // // //     alignItems: 'center',
// // // // // //     borderTopWidth: StyleSheet.hairlineWidth,
// // // // // //     borderTopColor: '#ccc',
// // // // // //     paddingVertical: 30,
// // // // // //     paddingHorizontal: 20,
// // // // // //   },
// // // // // //   icon: {
// // // // // //     marginRight: 10,
// // // // // //   },
// // // // // //   label: {
// // // // // //     fontSize: 16,
// // // // // //     fontWeight: 'bold',
// // // // // //     color: 'black',
// // // // // //     marginLeft: 10,
// // // // // //   },
// // // // // // });
