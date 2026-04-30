import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView
} from 'react-native';
import db from '../database/db';

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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Edit', { id: route.params.id, refresh: _queryByID })}
        >
          <Text style={styles.editLabel}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status pill */}
        <View style={[styles.statusPill, isDone ? styles.pillDone : styles.pillPlanned]}>
          <View style={[styles.pillDot, isDone ? styles.pillDotDone : styles.pillDotPlanned]} />
          <Text style={[styles.pillText, isDone ? styles.pillTextDone : styles.pillTextPlanned]}>
            {isDone ? 'Completed' : 'Planned'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Date card */}
        <View style={styles.infoCard}>
          <View>
            <Text style={styles.infoLabel}>Scheduled for</Text>
            <Text style={styles.infoValue}>{formatted(date)}</Text>
          </View>
        </View>

      </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Timer', { taskId: route.params.id })}
          >
            <Text style={styles.startLabel}>  Start Now</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

export default ViewPlannedScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBEBEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 24, color: '#1A1A1A', lineHeight: 28 },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
  },
  editLabel: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: 0.3 },

  // Content
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40 },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  pillPlanned: { backgroundColor: '#EAF2FF' },
  pillDone: { backgroundColor: '#EAFAF1' },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillDotPlanned: { backgroundColor: '#4A90E2' },
  pillDotDone: { backgroundColor: '#5CB85C' },
  pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  pillTextPlanned: { color: '#4A90E2' },
  pillTextDone: { color: '#5CB85C' },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 28,
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoIcon: { fontSize: 22 },
  infoLabel: { fontSize: 11, color: '#999', fontWeight: '500', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#1A1A1A', fontWeight: '600' },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: '#F7F7F5',
  },
  startButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startLabel: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});