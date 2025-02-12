import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, FlatList } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { HISTORY } from '@/constants/storage';
import { useFocusEffect } from 'expo-router';

export default function History() {
  const [history, setHistory] = useState<
    { date: string; amount: string; code: string; converted: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedHistory = await AsyncStorage.getItem(HISTORY);
        if (savedHistory) setHistory(JSON.parse(savedHistory));
      };

      loadData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>История:</Text>
        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.historyItem}>
              <Text style={styles.historyItemText}>
                {item.date} - {item.amount} {item.code} → {item.converted} Лари
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  safeArea: {
    backgroundColor: '#222',
    flex: 1,
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyItemText: {
    fontSize: 16,
    color: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
  },
});
