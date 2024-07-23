import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import profile from '../../../assets/images/profile.png';
import groupPic from '../../../assets/images/communLogo.jpg';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useActionSheet } from '@expo/react-native-action-sheet';

const RideItem = ({ fullName, fromLocation, toLocation, date, time, cost, vacantPlaces, comments, profilePicUrl, phoneNumber, groupImageUrl }) => {
    const profileImage = profilePicUrl ? { uri: profilePicUrl } : profile;
    const groupProfileImage = groupImageUrl ? { uri: groupImageUrl } : groupPic;
    const [expanded, setExpanded] = useState(false);
    const { showActionSheetWithOptions } = useActionSheet();

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handlePhonePress = () => {
        const options = ['Chat on WhatsApp', 'Call Phone Number', 'Cancel'];
        const cancelButtonIndex = 2;

        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            (buttonIndex) => {
                if (buttonIndex === 0) {
                    handleWhatsApp();
                } else if (buttonIndex === 1) {
                    handleCall();
                }
            }
        );
    };


// when I press on chat on whatsapp, I get transferred to whatsapp but with an error saying: this link couldn't be opened. check the link and try again. fix it for me

const handleWhatsApp = () => {
    // Remove any non-numeric characters from the phone number
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');

    // Ensure the phone number includes the country code for Israel
    let formattedPhoneNumber = cleanedPhoneNumber;

    // Check if the number starts with the local format (e.g., 054) and prepend the country code
    if (formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = '+972' + formattedPhoneNumber.substring(1);
    }


    const url = `https://wa.me/${formattedPhoneNumber}`;


    Linking.openURL(url).catch((err) => {
        console.error('An error occurred:', err);
        alert('Make sure WhatsApp is installed on your device');
    });
};



const handleCall = () => {
    // Ensure the phone number includes the country code for Israel
    let formattedPhoneNumber = phoneNumber.replace(/\D/g, '');

    if (formattedPhoneNumber.startsWith('0')) {
        formattedPhoneNumber = '+972' + formattedPhoneNumber.substring(1);
    }

    const url = `tel:${formattedPhoneNumber}`;
    
    Linking.canOpenURL(url)
        .then((supported) => {
            if (!supported) {
                console.error('Can\'t handle URL:', url);
                alert('Unable to open the dialer. Please check the phone number and try again.');
            } else {
                return Linking.openURL(url);
            }
        })
        .catch((err) => {
            console.error('An error occurred:', err);
            alert('An error occurred while trying to open the dialer.');
        });
};


    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.infoText}>
                    <View style = {{flexDirection: 'row'}}> 
                        <Text style={[styles.rowText, { fontWeight: 'bold', fontSize: 16}]}>{fullName}</Text>
                        <Text style = {[styles.rowText, { fontWeight: 'bold', fontSize: 16}]}> has offered a ride!</Text>

                    </View>
                    <Text style={styles.rowText}>
                        <Text style={styles.boldText}>From: </Text>
                        {fromLocation}
                    </Text>
                    <Text style={styles.rowText}>
                        <Text style={styles.boldText}>To: </Text>
                        {toLocation}
                    </Text>
                    <Text style={styles.rowText}>
                        <Text style={styles.boldText}>When: </Text>
                        {date}, {time}
                    </Text>
                </View>
                <TouchableOpacity onPress={toggleExpanded}>
                    <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} color="black" />
                </TouchableOpacity>
            </View>
            {expanded && (
                <>
                    <View style={styles.expandedContent}>
                        <Image source={profileImage} style={styles.profileImage} />
                        <View style={styles.infoContainer}>
                            <Text style={styles.box}>
                                <Text style={styles.boldText}>Cost: </Text>
                                {cost}
                            </Text>
                            <Text style={styles.box}>
                                <Text style={styles.boldText}>Vacant Places: </Text>
                                {vacantPlaces}
                            </Text>
                            <Text style={styles.box} onPress={handlePhonePress}>
                                <Text style={styles.boldText}>Phone: </Text>
                                {phoneNumber}
                            </Text>
                            {comments ? (
                                <Text style={styles.box}>
                                    <Text style={styles.boldText}>Comments: </Text>
                                    {comments}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginVertical: 5,
        width: '95%',
        borderColor: 'lightblue',
        borderWidth: 3,
        padding: 10,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    groupProfileImage: {
        width: "20%",
        height: "90%",
        borderRadius: 25,
        marginRight: 10,
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
    },
    rowText: {
        fontSize: 16,
        marginBottom: 5,
    },
    boldText: {
        fontWeight: 'bold',
    },
    expandedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 40,
        marginRight: 10,
    },
    infoContainer: {
        flex: 1,
    },
    box: {
        backgroundColor: '#e0e0e0',
        padding: 5,
        marginVertical: 3,
        borderRadius: 5,
        textAlign: 'center',
    },
});

export default RideItem;
