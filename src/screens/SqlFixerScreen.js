import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { runSqlFixer } from '../utils/runSqlFixer';
import theme from '../styles/theme';

const SqlFixerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleRunSqlFixer = async () => {
    try {
      setLoading(true);
      setResult(null);
      setError(null);
      
      const response = await runSqlFixer();
      
      setResult(response);
      if (!response.success) {
        setError(response.error);
      }
    } catch (err) {
      console.error('Erro ao executar SQL Fixer:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SQL Fixer</Text>
      <Text style={styles.description}>
        Esta ferramenta tenta criar um usuário de teste e associações para verificar permissões no banco de dados.
        Use quando estiver enfrentando problemas para criar usuários ou associações de equipe.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRunSqlFixer}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Testar Permissões</Text>
        )}
      </TouchableOpacity>
      
      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado:</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(result, null, 2)}
          </Text>
        </ScrollView>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erro:</Text>
          <Text style={styles.errorText}>{error.toString()}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.light.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.light.text,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    color: theme.colors.light.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.sizes.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  resultContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.sizes.borderRadius.sm,
    maxHeight: 300,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: theme.colors.light.text,
  },
  resultText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.light.text,
  },
  errorContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: '#FFEBEE',
    borderRadius: theme.sizes.borderRadius.sm,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
    color: '#D32F2F',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#D32F2F',
  },
});

export default SqlFixerScreen;
