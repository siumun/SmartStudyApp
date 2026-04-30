import {
  Text, View, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Animated, PanResponder
} from 'react-native';
import FAB from '../components/FAB';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import db from '../database/db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import viewPlanned from './ViewPlannedScreen'

// -----------------------swipe-----------------

const SWIPE_THRESHOLD = 60;
const DELETE_BUTTON_WIDTH = 80;

const SwipeableTaskCard = ({
  item,
  status,
  onPress,
  onDelete,
}: {
  item: any;
  status: 'planned' | 'done';
  onPress: () => void;
  onDelete: () => void;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < 15,
      onPanResponderMove: (_, g) => {
        // Clamp to negative only (left swipe)
        const newX = Math.min(0, Math.max(g.dx, -(DELETE_BUTTON_WIDTH + 10)));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -DELETE_BUTTON_WIDTH,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(true);
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsOpen(false);
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
    setIsOpen(false);
  };

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onDelete());
  };

  const handlePress = () => {
    if (isOpen) {
      closeSwipe();
    } else {
      onPress();
    }
  };

  return (
    <View style={styles.swipeWrapper}>
      <View style={styles.deleteBackground}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <Icon 
          name="delete" 
          size={24}
          color="white"
          style={styles.deleteIcon}
          />
          <Text style={styles.deleteLabel}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[styles.card, status === 'done' && styles.cardDone, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardInner}
          onPress={handlePress}
          activeOpacity={0.75}
        >
          <View style={[styles.dot, status === 'done' ? styles.dotDone : styles.dotPlanned]} />
          <Text style={[styles.cardText, status === 'done' && styles.cardTextDone]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

//-----------------------Home Screen-----------------

const HomeScreen = ({ navigation }: any) => {
  const [plannedTasks, setPlannedTask] = useState<any[]>([]);
  const [doneTasks, setDoneTask] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadPlannedTasks();
      loadDoneTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const loadPlannedTasks = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        "SELECT * FROM tasks WHERE status = 'planned';",
        [],
        (_: any, results: any) => {

          const rows = [];
          for (let i = 0; i < results.rows.length; i++) rows.push(results.rows.item(i));
          setPlannedTask(rows);
        },
        (error: any) => { console.log('Error loading planned tasks:', error); return true; }
      );
    });
  };

  const loadDoneTasks = () => {
    db.transaction((tx: any) => {
      tx.executeSql(
        "SELECT * FROM tasks WHERE status = 'done';",
        [],
        (_: any, results: any) => {
          const rows = [];
          for (let i = 0; i < results.rows.length; i++) rows.push(results.rows.item(i));
          setDoneTask(rows);
        },
        (error: any) => { console.log('Error loading done tasks:', error); return true; }
      );
    });
  };

  const deleteTask = useCallback((id: number, status: 'planned' | 'done') => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'DELETE FROM tasks WHERE id = ?;',
        [id],
        () => {
          if (status === 'planned') {
            setPlannedTask(prev => prev.filter(t => t.id !== id));
          } else {
            setDoneTask(prev => prev.filter(t => t.id !== id));
          }
        },
        (error: any) => { console.log('Error deleting task:', error); return true; }
      );
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F5" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <Text style={styles.headerSubtitle}>
          {plannedTasks.length + doneTasks.length} total · {doneTasks.length} done
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <SectionHeader label="Planned" count={plannedTasks.length} />
        {plannedTasks.length === 0 ? (
          <EmptyState message="No planned tasks" />
        ) : (
          plannedTasks.map((item) => (
            <SwipeableTaskCard
              key={item.id}
              item={item}
              status="planned"
              onPress={() => navigation.navigate('ViewPlanned', { id: item.id })}
              onDelete={() => deleteTask(item.id, 'planned')}
            />
          ))
        )}

        <SectionHeader label="Done" count={doneTasks.length} />
        {doneTasks.length === 0 ? (
          <EmptyState message="No completed tasks yet" />
        ) : (
          doneTasks.map((item) => (
            <SwipeableTaskCard
              key={item.id}
              item={item}
              status="done"
              onPress={() => navigation.navigate('ViewDone', { id: item.id })}
              onDelete={() => deleteTask(item.id, 'done')}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        onStartNow={() => navigation.navigate('StartNow')}
        onPlan={() => navigation.navigate('CreatePlan')}
      />
    </View>
  );
};

// -----------------------helper-----------------

const SectionHeader = ({ label, count }: { label: string; count: number }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  </View>
);

const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

export default HomeScreen;

// ------------------------Styles-----------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: { paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1A1A1A', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#999', marginTop: 4 },
  scrollContent: { paddingHorizontal: 24, },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24, marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 },
  badge: { backgroundColor: '#E8E8E4', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#888' },

  // Swipe container
  swipeWrapper: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: '#b9b4b4',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteButton: {
    width: DELETE_BUTTON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  deleteIcon: { fontSize: 20, marginLeft: 35 },
  deleteLabel: { fontSize: 11, marginLeft: 35, fontWeight: '600', color: '#fff', letterSpacing: 0.3 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardDone: { opacity: 0.6 },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotPlanned: { backgroundColor: '#4A90E2' },
  dotDone: { backgroundColor: '#5CB85C' },
  cardText: { fontSize: 15, color: '#1A1A1A', flex: 1 },
  cardTextDone: { textDecorationLine: 'line-through', color: '#999' },
  chevron: { fontSize: 20, color: '#CCC', fontWeight: '300' },

  emptyState: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#BBBBBB' },
});