import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView
} from 'react-native';
import db from '../database/db';
import Header from '../components/Header';
import PrimaryButton from '../components/PrimaryButton';


export const formatted = (inputDate: Date) => {
  const daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${daysText[inputDate.getDay()]}, ${monthsText[inputDate.getMonth()]} ${inputDate.getDate()}, ${inputDate.getFullYear()}`;
};

const ViewPlannedScreen = ({ route, navigation }: any) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [status, setStatus] = useState('');

  const _queryByID = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT * FROM tasks WHERE id = ?',
        [route.params.id],
        (_: any, results: any) => {
          const item = results.rows.item(0);
          
          console.log('DB ITEM:', item);
          if (item) {
            setTitle(item.title);
            setDate(new Date(Number(item.date)));
            setStatus(item.status);
          }
        },
        (err: any) => {
          console.log('Error executing query by ID:', err);
          return true;
        }
      );
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', _queryByID);
    return unsubscribe;
  }, [navigation, route.params.id]);

  const isDone = status === 'done';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F5" />

      <Header 
      navigation={navigation} 
      showEdit={true} 
      onEditPress={() => navigation.navigate('Edit')}
      />

<View  style={{flex: 1, backgroundColor: '#F4F6FB', padding: 16}}>

  <View style={[
    styles.statusPill, 
    isDone ? styles.pillDone : styles.pillPlanned
  ]}>
    <View style={[
      styles.pillDot, 
      isDone ? styles.pillDotDone : styles.pillDotPlanned
    ]} />
    <Text style={[
      styles.pillText, 
      isDone ? styles.pillTextDone : styles.pillTextPlanned
    ]}>
      {isDone ? 'Completed' : 'Planned'}
    </Text>
  </View>

  {/* Title */}
  <Text style={styles.title}>{title}</Text>

  {/* Date card */}
  <View style={styles.infoCard}>
    <View>
      <Text style={styles.infoLabel}>Scheduled</Text>
      <Text style={styles.infoValue}>{formatted(date)}</Text>
    </View>
  </View>

  <PrimaryButton
        title="Next" 
        onPress={() => navigation.navigate('Location', { taskId: route.params.id })}
  />
</View>
      
    </View>
  );
};


export default ViewPlannedScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FB'
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  pillPlanned: { backgroundColor: '#EEF4FF' },
  pillDone: { backgroundColor: '#EAF7EF' },

  pillDot: { 
    width: 7, 
    height: 7, 
    borderRadius: 3.5,
    marginRight: 6 
  },
  pillDotPlanned: { backgroundColor: '#4A90E2' },
  pillDotDone: { backgroundColor: '#5CB85C' },

  pillText: { 
    fontSize: 12, 
    fontWeight: '600',
    letterSpacing: 0.3
  },
  pillTextPlanned: { color: '#4A90E2' },
  pillTextDone: { color: '#5CB85C' },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    lineHeight: 34,
    marginBottom: 24,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,

    elevation: 2,
  },

  infoLabel: { 
    fontSize: 11, 
    color: '#888', 
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.6,
  },

  infoValue: { 
    fontSize: 16, 
    color: '#111', 
    fontWeight: '600' 
  },
});