import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db, storage } from './firebaseConfig';
import { getDownloadURL, ref } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState({
    profilePicture: null,
    fullName: '',
  });

  useEffect(() => {
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
  }, []);

  return (
    <UserContext.Provider value={{ userProfile, setUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
