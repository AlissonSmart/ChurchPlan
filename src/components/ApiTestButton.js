import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ScrollView, Modal } from 'react-native';
import apiTester from '../utils/apiTester';

/**
 * Botão para testar as APIs diretamente no aplicativo
 */
const ApiTestButton = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Sobrescrever console.log e console.error para capturar os logs
  const setupLogCapture = () => {
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { type: 'log', message }]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      setLogs(prev => [...prev, { type: 'error', message }]);
      originalError(...args);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  };

  const runTests = async () => {
    setLogs([]);
    setIsRunning(true);
    setModalVisible(true);
    
    const restoreConsole = setupLogCapture();
    
    try {
      await apiTester.runAllTests();
    } catch (error) {
      console.error('Erro ao executar testes:', error);
    } finally {
      restoreConsole();
      setIsRunning(false);
    }
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.button} 
        onPress={runTests}
        disabled={isRunning}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Testando APIs...' : 'Testar APIs'}
        </Text>
      </TouchableOpacity>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resultados dos Testes</Text>
            
            <ScrollView style={styles.logsContainer}>
              {logs.map((log, index) => (
                <Text 
                  key={index} 
                  style={[
                    styles.logText, 
                    log.type === 'error' ? styles.errorText : null
                  ]}
                >
                  {log.message}
                </Text>
              ))}
              
              {logs.length === 0 && (
                <Text style={styles.noLogsText}>Executando testes...</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  logsContainer: {
    maxHeight: 400,
    marginBottom: 20,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  errorText: {
    color: '#FF3B30',
  },
  noLogsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ApiTestButton;
