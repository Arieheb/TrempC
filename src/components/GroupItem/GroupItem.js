import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const GroupItem = ({ item }) => {
  return (
      <View>
          <View style={styles.tableRow}>
              <Text style={styles.groupName}>{item.groupName}</Text>
              <View style={styles.icons}>
                  <TouchableOpacity onPress={() => toggleGroup(item.id)} style={styles.iconButton}>
                      <Icon name={expandedGroup === item.id ? 'caret-down' : 'caret-right'} size={25} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleAddParticipants(item)} style={styles.iconButton}>
                      <Icon name="plus" size={25} color="grey" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteGroup(item)} style={styles.iconButton}>
                      <Icon name="trash" size={25} color="red" />
                  </TouchableOpacity>
              </View>
          </View>
          {expandedGroup === item.id && (
              <View style={styles.participantsList}>
                  {item.participantsDetails?.map((participant, idx) => (
                      <View
                          key={participant.id}
                          style={[
                              styles.participantRow,
                              idx === item.participantsDetails.length - 1 && { borderBottomWidth: 0 }
                          ]}
                      >
                          <Text style={styles.numberCell}>{idx + 1}.</Text>
                          <Text style={[styles.participantName, participant.fullName === 'Me' && { fontStyle: 'italic' }]}>
                              {participant.fullName}
                          </Text>
                          <Text style={styles.tableCell}>{participant.phoneNumber}</Text>
                      </View>
                  ))}
              </View>
          )}
      </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 18,
  },
});

export default GroupItem;
