import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from './UserContext';
import { getDownloadURL, ref } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { storage, db } from './firebaseConfig';

/**
 * CustomDrawerItem component renders individual items in the custom drawer.
 *
 * icon: The icon to be displayed.
 * label: The label for the item.
 * onPress: Function to handle the press event.
 */
const CustomDrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.itemContent}>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

/**
 * CustomDrawerContent component provides custom content for the drawer.
 *
 * navigation: The navigation object.
 * props: Additional props passed to the component.
 *
 */
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

  /**
   * Handles the sign-out action.
   */
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
        <Ionicons name="exit-outline" size={24} color="black" style={styles.signOutIcon} />
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  signOutIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 5,
  },
  signOutText: {
    fontSize: 20,
    color: 'black',
  },
});
