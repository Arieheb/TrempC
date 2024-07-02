// Drawer.js
import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Ionicons for icons
import { auth } from './firebaseConfig';

// Custom drawer item component
const CustomDrawerItem = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.drawerItem}>
    <View style={styles.itemContent}>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default function CustomDrawerContent({ navigation, ...props }) {
  const handleSignOut = () => {
    auth.signOut()
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'loginScreen' }],
        });
      })
      .catch(error => console.error(error));
  };

  const drawerItems = [
    { icon: 'home', label: 'Home', onPress: () => navigation.navigate('homeScreen') },
    { icon: 'person', label: 'Profile', onPress: () => navigation.navigate('profileScreen') },
    { icon: 'car', label: 'New Ride', onPress: () => navigation.navigate('newRideScreen') },
    { icon: 'people', label: 'New Group', onPress: () => navigation.navigate('newGroupsScreen') },
    // Add more drawer items as needed
  ];

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.drawerContent}>
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
    borderWidth: 0, // Remove border around drawer content
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
    marginLeft: 10, // Add left margin to the label for spacing
  },
});

// // Drawer.js
// import React from 'react';
// import { View, Button } from 'react-native';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import { auth } from './firebaseConfig';

// export default function CustomDrawerContent({ navigation, ...props }) {
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

//   return (
//     <DrawerContentScrollView {...props}>
//       <DrawerItemList {...props} />
//       <View style={{ marginTop: 20, paddingHorizontal: 10 }}>
//         <Button title="Sign Out" onPress={handleSignOut} />
//       </View>
//     </DrawerContentScrollView>
    
//   );
// }
