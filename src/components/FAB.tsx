import { View, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';
import { Image } from 'react-native';

type Props = {
  onStartNow: () => void;
  onPlan: () => void;
};

export const FAB = ({ onStartNow, onPlan }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      {open && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              setOpen(false);
              onPlan();
            }}
          >
            <Image
              source={require('./../assets/icons/plan2.png')}
              style={{ width: 30, height: 35 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => {
              setOpen(false);
              onStartNow();
            }}
          >
            <Image
              source={require('./../assets/icons/start.jpg')}
              style={{ width: 30, height: 35 }}
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.fabIcon}>{open ? '×' : '+'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FAB;

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'flex-end',
  },

  menu: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },

  option: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 10,

    // elevation (Android)
    elevation: 4,
  },

  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',

    justifyContent: 'center',
    alignItems: 'center',

    //shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },

  fabIcon: {
    fontSize: 30,
    color: '#000000',
    fontWeight: 'bold',
  },
});