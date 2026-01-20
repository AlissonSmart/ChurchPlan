import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, useColorScheme } from 'react-native';
import theme from '../styles/theme';

/**
 * Componente de esqueleto para carregamento
 * @param {Object} props - Propriedades do componente
 * @param {string} props.type - Tipo de esqueleto: 'team' ou 'user'
 * @param {number} props.count - Número de itens a serem renderizados
 * @param {Object} props.style - Estilos adicionais
 * @returns {React.ReactNode}
 */
const SkeletonLoader = ({ type = 'team', count = 5, style }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  
  // Animação de shimmer
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  // Configurar animação
  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    
    shimmerAnimation.start();
    
    return () => {
      shimmerAnimation.stop();
    };
  }, []);
  
  // Interpolação para o efeito de shimmer
  const shimmerColors = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDarkMode ? 'rgba(50, 50, 50, 0.3)' : 'rgba(230, 230, 230, 0.5)',
      isDarkMode ? 'rgba(70, 70, 70, 0.5)' : 'rgba(250, 250, 250, 0.8)',
    ],
  });
  
  // Renderizar um item de esqueleto para equipe
  const renderTeamSkeleton = (index) => {
    return (
      <View key={`team-skeleton-${index}`} style={[styles.teamItem, { backgroundColor: colors.card }]}>
        <View style={styles.teamAvatarContainer}>
          <Animated.View 
            style={[
              styles.teamAvatar, 
              { backgroundColor: shimmerColors }
            ]} 
          />
        </View>
        <View style={styles.teamContent}>
          <Animated.View 
            style={[
              styles.teamName, 
              { backgroundColor: shimmerColors }
            ]} 
          />
          <Animated.View 
            style={[
              styles.teamInfo, 
              { backgroundColor: shimmerColors }
            ]} 
          />
        </View>
        <Animated.View 
          style={[
            styles.teamAction, 
            { backgroundColor: shimmerColors }
          ]} 
        />
      </View>
    );
  };
  
  // Renderizar um item de esqueleto para usuário
  const renderUserSkeleton = (index) => {
    return (
      <View key={`user-skeleton-${index}`} style={[styles.userItem, { backgroundColor: colors.card }]}>
        <Animated.View 
          style={[
            styles.userAvatar, 
            { backgroundColor: shimmerColors }
          ]} 
        />
        <View style={styles.userContent}>
          <Animated.View 
            style={[
              styles.userName, 
              { backgroundColor: shimmerColors }
            ]} 
          />
          <Animated.View 
            style={[
              styles.userEmail, 
              { backgroundColor: shimmerColors }
            ]} 
          />
          <Animated.View 
            style={[
              styles.userRole, 
              { backgroundColor: shimmerColors }
            ]} 
          />
        </View>
        <Animated.View 
          style={[
            styles.userAction, 
            { backgroundColor: shimmerColors }
          ]} 
        />
      </View>
    );
  };
  
  // Renderizar o número especificado de itens
  const renderItems = () => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(
        type === 'team' ? renderTeamSkeleton(i) : renderUserSkeleton(i)
      );
    }
    return items;
  };
  
  return (
    <View style={[styles.container, style]}>
      {renderItems()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  teamAvatarContainer: {
    marginRight: 12,
  },
  teamAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamContent: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    height: 18,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  teamInfo: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
  teamAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userContent: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    height: 18,
    width: '60%',
    borderRadius: 4,
    marginBottom: 6,
  },
  userEmail: {
    height: 14,
    width: '80%',
    borderRadius: 4,
    marginBottom: 6,
  },
  userRole: {
    height: 12,
    width: '30%',
    borderRadius: 4,
  },
  userAction: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default SkeletonLoader;
