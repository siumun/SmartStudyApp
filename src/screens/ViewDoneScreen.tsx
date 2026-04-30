import React, {useCallback, useEffect, useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, ScrollView, ToastAndroid, StyleSheet, StatusBar
} from 'react-native';
import db from '../database/db';


export const formatted = (inputDate: Date) => {
  const daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${daysText[inputDate.getDay()]}, ${monthsText[inputDate.getMonth()]} ${inputDate.getDate()}, ${inputDate.getFullYear()}`;
};

const formatDuration = (sec: number) => {
  if (!sec) return '0s';

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  return `${h}h ${m}m ${s}s`;
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F7F5'},

  content: {
    padding: 24,
    paddingTop: 60,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A1A1A',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 56, paddingBottom: 12,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EBEBEA', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#1A1A1A', lineHeight: 28 },
  editButton: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 10, backgroundColor: '#1A1A1A',
  },
});

const ViewDoneDetailScreen = ({route, navigation}: any) => {

  const {id} = route.params;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [location, setLocation] = useState('N/A');

  const _loadData = useCallback(() => {
    db.transaction((tx: any) => {

      tx.executeSql(
        `
        SELECT 
          t.title,
          t.date,
          IFNULL(SUM(s.duration), 0) AS totalDuration,
          MAX(s.location_id) AS location_id
        FROM tasks t
        LEFT JOIN sessions s
          ON t.id = s.task_id
        WHERE t.id = ?
        GROUP BY t.id
        `,
        [Number(id)],

        (_: any, results: any) => {

          if (results.rows.length > 0) {
            const item = results.rows.item(0);

            console.log('DEBUG item:', JSON.stringify(item));

            setTitle(item.title || '');

            // Handle both timestamp number and date string formats
            const raw = item.date;
            const parsed = isNaN(Number(raw))
              ? new Date(raw)
              : new Date(Number(raw));
            setDate(parsed);

            // Safely cast duration in case of NULL
            setDuration(Number(item.totalDuration) || 0);

            setLocation(
              item.location_id
                ? `Location ${item.location_id}`
                : 'N/A'
            );
          }
        },

        (err: any) => {
          console.log('SQL ERROR:', err);
          return true;
        }
      );
    });
  }, [id]);

  useEffect(() => {
    _loadData();
  }, [_loadData]);

  return (
    <View style={styles.container}>

        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
        </View>
        
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F5" />

      <ScrollView contentContainerStyle={styles.content}>

        {/* TITLE */}
        <Text style={styles.title}>{title}</Text>

        {/* DATE */}
        <View style={styles.card}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date ? formatted(date) : '—'}</Text>
        </View>

        {/* DURATION */}
        <View style={styles.card}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formatDuration(duration)}</Text>
        </View>

        {/* LOCATION */}
        <View style={styles.card}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{location}</Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default ViewDoneDetailScreen;
