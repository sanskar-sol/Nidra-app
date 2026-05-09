import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

export function Clock() {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.clockRow}>
      <Text style={styles.mainClockText}>{time.format('h:mm')}</Text>
      <Text style={styles.ampmText}>{time.format('A')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  clockRow: { flexDirection: 'row', alignItems: 'baseline' },
  mainClockText: { fontSize: 100, color: 'white', fontFamily: 'Inter_300Light', letterSpacing: 1 },
  ampmText: { fontSize: 24, color: 'white', fontFamily: 'Inter_300Light', marginLeft: 8 },
});
