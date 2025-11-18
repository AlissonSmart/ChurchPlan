import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import theme from '../styles/theme';

/**
 * Componente para exibir um item de equipe
 * @param {Object} team - Dados da equipe
 * @param {function} onPress - Função chamada quando o item é pressionado
 * @param {function} onEdit - Função chamada quando o botão de editar é pressionado
 * @param {Object} colors - Cores a serem usadas (para suporte a modo escuro)
 * @returns {React.ReactNode}
 */
const TeamItem = ({ team, onPress, onEdit, colors }) => {
  // Verificar se o item é válido
  if (!team || !team.name) {
    return null;
  }

  // Função para lidar com o clique no ícone de edição
  const handleEditPress = () => {
    if (onEdit) {
      onEdit(team);
    }
  };

  // Função para gerar uma cor baseada no nome da equipe
  const getTeamColor = (name) => {
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      '#4CAF50', // verde
      '#FF9800', // laranja
      '#9C27B0', // roxo
      '#00BCD4', // ciano
    ];
    
    // Usar a soma dos códigos ASCII das letras do nome para escolher uma cor
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Gerar a cor da equipe
  const teamColor = getTeamColor(team.name);

  // Obter a primeira letra do nome da equipe para o avatar
  const initial = team.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={() => onPress && onPress(team)}
    >
      <View style={[styles.avatar, { backgroundColor: teamColor }]}>
        <Text style={styles.initial}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{team.name}</Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {team.members_count || 0} membros • {team.roles_count || 0} funções
        </Text>
      </View>
      <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
        <FontAwesome name="pencil" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.sizes.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  details: {
    fontSize: theme.typography.fontSize.sm,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TeamItem;
