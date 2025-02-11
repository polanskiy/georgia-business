import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import dayjs, { Dayjs } from 'dayjs'; // Import dayjs
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { DatePickerInput } from '../dayPicker';

const API_URL =
  'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/';

export const Bank = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null); // Date state

  // Load the saved date from AsyncStorage when the component mounts
  useEffect(() => {
    const loadSavedDate = async () => {
      const savedDate = await AsyncStorage.getItem('selectedDate');
      if (savedDate) {
        setSelectedDate(dayjs(savedDate)); // Set the saved date if it exists
      }
    };

    loadSavedDate();
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [selectedDate]);

  const fetchCurrencies = async () => {
    try {
      const dateParam = selectedDate ? selectedDate.format('YYYY-MM-DD') : ''; // Convert to 'YYYY-MM-DD' format
      const url = `${API_URL}?date=${dateParam}`;
      const response = await fetch(url);
      const json = await response.json();
      setData(json[0].currencies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DatePickerInput
        onSetSelectedDate={setSelectedDate}
        selectedDate={selectedDate}
      />

      {/* Currency list */}
      <View style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : data.length === 0 ? (
          <Text style={styles.noDataText}>Нет данных для отображения</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.currency}>{item.code}</Text>
                <Text style={styles.rate}>{item.rate} GEL</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
  },
  inputContainer: {
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateInput: {
    height: 40,
    borderColor: '#007AFF',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  listContainer: {
    flex: 1,
    marginTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  currency: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rate: {
    fontSize: 16,
    color: '#555',
  },
  noDataText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
