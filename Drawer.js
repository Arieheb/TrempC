import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { auth, db, storage } from './firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

const CustomDrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.itemContent}>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default function CustomDrawerContent({ navigation, ...props }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const email = user.email.toLowerCase();
      const profilePicRef = ref(storage, `profile/${email}`);

      getDownloadURL(profilePicRef)
        .then(url => setProfilePicture(url))
        .catch(() => {
          setProfilePicture(require('./assets/images/profile.png'));
        });

      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef)
        .then(docSnap => {
          if (docSnap.exists()) {
            const { firstName, lastName } = docSnap.data();
            setFullName(`${firstName} ${lastName}`);
          } else {
            console.log('No such document!');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, []);

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
          {profilePicture && <Image source={typeof profilePicture === 'string' ? { uri: profilePicture } : profilePicture} style={styles.profilePicture} />}
          <Text style={styles.fullName}>{fullName}</Text>
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

// // Drawer.js
// import React, { useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Ionicons for icons
// import { auth, db, storage } from './firebaseConfig'; // Import firestore and storage
// import { getDownloadURL, ref } from 'firebase/storage';
// import { doc, getDoc } from 'firebase/firestore';

// // Custom drawer item component
// const CustomDrawerItem = ({ icon, label, onPress }) => (
//   <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
//     <View style={styles.itemContent}>
//       <Ionicons name={icon} size={24} color="black" style={styles.icon} />
//       <Text style={styles.label}>{label}</Text>
//     </View>
//   </TouchableOpacity>
// );

// export default function CustomDrawerContent({ navigation, ...props }) {
//   const [profilePicture, setProfilePicture] = useState(null);
//   const [fullName, setFullName] = useState('');

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {
//       const email = user.email.toLowerCase();
//       const profilePicRef = ref(storage, `profile/${email}`);

//       // Fetch the profile picture URL if it exists
//       getDownloadURL(profilePicRef)
//         .then(url => setProfilePicture(url))
//         .catch(() => {
//           // If there's an error (e.g., file doesn't exist), use the local profile picture
//           setProfilePicture(require('./assets/images/profile.png'));
//         });

//       // Fetch the user's full name
//       const userRef = doc(db, 'users', user.uid);
//       getDoc(userRef)
//         .then(docSnap => {
//           if (docSnap.exists()) {
//             const { firstName, lastName } = docSnap.data();
//             setFullName(`${firstName} ${lastName}`);
//           } else {
//             console.log('No such document!');
//           }
//         })
//         .catch(error => console.error('Error fetching user data:', error));
//     }
//   }, []);

//   const handleSignOut = () => {
//     auth.signOut()
//       .then(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'loginScreen' }],
//         });
//       })
//       .catch(error => console.error(error));
//   };

//   const drawerItems = [
//     { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
//     { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
//     { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
//     { icon: 'list', label: 'Group List', onPress: () => navigation.navigate('gListScreen') },
//     // Add more drawer items as needed
//   ];

//   return (
//     <View style={styles.container}>
//       <DrawerContentScrollView {...props} style={styles.drawerContent}>
//         <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('profileScreen')}>
//           {profilePicture && <Image source={typeof profilePicture === 'string' ? { uri: profilePicture } : profilePicture} style={styles.profilePicture} />}
//           <Text style={styles.fullName}>{fullName}</Text>
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
//     borderWidth: 0, // Remove border around drawer content
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
//     marginLeft: 10, // Add left margin to the label for spacing
//   },
// });
