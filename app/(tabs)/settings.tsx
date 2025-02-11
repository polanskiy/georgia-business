import { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOTAL } from '@/constants/storage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFocusEffect } from 'expo-router';

export default function Settings() {
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedTotal = await AsyncStorage.getItem(TOTAL);
        if (savedTotal) setTotal(parseFloat(savedTotal));
      };

      loadData();
    }, [])
  );

  const handleRemoveClearTotal = async () => {
    setModalVisible(false);

    await AsyncStorage.setItem(TOTAL, '0');
    setTotal(0);
  };

  const handleModal = () => {
    if (total === 0) return;
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.label}>Всего:</Text>
            <Text style={styles.total}>
              {total.toFixed(2)} <Text style={styles.lari}>Лари</Text>
            </Text>
          </View>

          <View style={styles.item}>
            <TouchableOpacity onPress={handleModal}>
              <IconSymbol
                size={48}
                name="trash.square.fill"
                color={total === 0 ? '#aaa' : '#007AFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Удалить?</Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleRemoveClearTotal}
                >
                  <Text style={styles.buttonText}>Да</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  safeArea: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  total: {
    margin: 0,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  lari: {
    fontSize: 16,
    color: '#eee',
  },
  item: { flexDirection: 'column' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#E53935',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
