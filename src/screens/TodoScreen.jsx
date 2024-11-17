import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from 'react-native';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { AddCircle, CloseCircle, TickCircle, Trash, Edit2 } from 'iconsax-react-native';

const TodoScreen = () => {
  const [todo, setTodo] = useState(''); // Yeni todo metni
  const [todos, setTodos] = useState([]); // Todo listesi
  const [modalVisible, setModalVisible] = useState(false); // Modalın görünürlüğü
  const [selectedTodo, setSelectedTodo] = useState(null); // Seçili todo
  const [updatedText, setUpdatedText] = useState(''); // Güncellenen metin

  // AsyncStorage'a todo kaydetme
  const saveTodos = async saveTodo => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(saveTodo));
    } catch (error) {
      console.log(error);
    }
  };

  // AsyncStorage'dan todo yükleme
  const loadTodos = async () => {
    try {
      const storedData = await AsyncStorage.getItem('todos');
      if (storedData) {
        setTodos(JSON.parse(storedData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Todo silme
  const deleteTodo = async id => {
    const updatedTodos = todos.filter(item => item.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  // Todo tamamlama/geri alma
  const completeTodo = async id => {
    const updatedTodos = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  // Todo güncelleme
  const updateTodos = () => {
    if (!selectedTodo || !updatedText) return;

    const updatedTodos = todos.map(item =>
      item.id === selectedTodo.id ? { ...item, text: updatedText } : item,
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setModalVisible(false);
    setUpdatedText('');
  };

  // İlk açılışta AsyncStorage'dan todoları yükleme
  useEffect(() => {
    loadTodos();
  }, []);

  // Yeni todo ekleme
  const addTodo = () => {
    if (!todo.trim()) {
      Alert.alert('Hata', 'Todo boş olamaz.');
      return;
    }
    const updatedTodos = [...todos, { id: uuid.v4(), text: todo, completed: false }];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setTodo('');
  };

  return (
    <LinearGradient colors={['#fef3c7', '#a78bfa']} style={styles.container}>
      <SafeAreaView>
        <Text style={styles.headerText}>TO-DO LIST</Text>
        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={text => setTodo(text)}
            placeholder="Todo yazın"
            style={styles.input}
            value={todo}
          />
          <TouchableOpacity
            onPress={addTodo}
            style={[styles.button, styles.addButton]}>
            <AddCircle size="32" color="#ff8a65" variant="Broken" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={todos}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completedText,
                ]}>
                {item?.text}
              </Text>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => completeTodo(item?.id)}
                  style={[styles.button, styles.completeButton]}>
                  {item.completed ? (
                    <CloseCircle size="24" color="#000" variant="Broken" />
                  ) : (
                    <TickCircle size="27" color="#ff8a65" variant="Broken" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedTodo(item);
                    setUpdatedText(item.text);
                    setModalVisible(true);
                  }}
                  style={[styles.button, styles.updateButton]}>
                  <Edit2 size="27" color="#ff8a65" variant="Broken" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteTodo(item?.id)}
                  style={[styles.button, styles.deleteButton]}>
                  <Trash size="27" color="#ff8a65" variant="Broken" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Güncelleme Modalı */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Todo Güncelle</Text>
              <TextInput
                style={styles.modalInput}
                value={updatedText}
                onChangeText={setUpdatedText}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}>
                  <Text style={styles.modalButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={updateTodos}
                  style={[styles.modalButton, styles.saveButton]}>
                  <Text style={styles.modalButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default TodoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 20,  
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    flex: 1,
    borderRadius: 10,
    borderColor: 'gray',
  },
  button: {
    marginLeft: 10,
    borderRadius: 5,
  },
  addButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  todoText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
    fontSize: 15,
  },
  completeButton: {
    padding: 10,
  },
  updateButton: {
    padding: 10,
  },
  deleteButton: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    borderColor: 'gray',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

