import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import db from '../database/db';

const TimerScreen = ({route, navigation}: any) => {
  const {taskId} = route.params;

  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const togglePause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  const endTask = () => {
    clearInterval(intervalRef.current);
    const finalDuration = seconds;

    db.transaction(
      (tx: any) => {
        tx.executeSql(
          'UPDATE sessions SET duration = ? WHERE task_id = ?',
          [finalDuration, taskId],
          (_: any, result: any) =>
            console.log('Session saved, rows affected:', result.rowsAffected),
          (_: any, err: any) => { console.log('SESSION ERROR:', err); return true; },
        );
        tx.executeSql(
          'UPDATE tasks SET status = ? WHERE id = ?',
          ['done', taskId],
          (_: any, result: any) =>
            console.log('Task marked done, rows affected:', result.rowsAffected),
          (_: any, err: any) => { console.log('UPDATE ERROR:', err); return true; },
        );
      },
      (err: any) => console.log('TRANSACTION ERROR:', err),
      () => navigation.popToTop(),
    );
  };

  const formatTime = () => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [hh, mm, ss] = formatTime().split(':');

  return (
    <View style={styles.container}>

      {/* Status pill */}
      <View style={[styles.statusPill, isRunning ? styles.pillActive : styles.pillPaused]}>
        <View style={[styles.statusDot, isRunning ? styles.dotActive : styles.dotPaused]} />
        <Text style={[styles.statusText, isRunning ? styles.statusTextActive : styles.statusTextPaused]}>
          {isRunning ? 'IN PROGRESS' : 'PAUSED'}
        </Text>
      </View>

      {/* Timer card */}
      <View style={styles.timerCard}>
        <View style={styles.timerRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeDigits}>{hh}</Text>
            <Text style={styles.timeLabel}>HR</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeBlock}>
            <Text style={styles.timeDigits}>{mm}</Text>
            <Text style={styles.timeLabel}>MIN</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeBlock}>
            <Text style={styles.timeDigits}>{ss}</Text>
            <Text style={styles.timeLabel}>SEC</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity onPress={togglePause} activeOpacity={0.7} style={[styles.btn, styles.btnPause]}>
          <Text style={styles.btnPauseText}>
            {isRunning ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={endTask} activeOpacity={0.7} style={[styles.btn, styles.btnEnd]}>
          <Text style={styles.btnEndText}>End Task</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
    paddingHorizontal: 28,
    gap: 28,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: '#EBF7F0',
    borderColor: '#A8DDB8',
  },
  pillPaused: {
    backgroundColor: '#FFF8E7',
    borderColor: '#FFD980',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {backgroundColor: '#22C55E'},
  dotPaused: {backgroundColor: '#F59E0B'},
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  statusTextActive: {color: '#16A34A'},
  statusTextPaused: {color: '#D97706'},
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#9BAFD0',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 68,
  },
  timeDigits: {
    fontSize: 52,
    fontWeight: '300',
    color: '#1A2340',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#9BAFD0',
    marginTop: 2,
  },
  colon: {
    fontSize: 44,
    fontWeight: '200',
    color: '#C8D4E8',
    marginBottom: 16,
  },
  buttonGroup: {
    width: '100%',
    gap: 12,
  },
  btn: {
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPause: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1DCF0',
    shadowColor: '#9BAFD0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  btnPauseText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A2340',
    letterSpacing: 0.3,
  },
  btnEnd: {
    backgroundColor: '#FF4D4D',
    shadowColor: '#FF4D4D',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  btnEndText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

export default TimerScreen;