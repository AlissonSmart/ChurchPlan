import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import CreateTeamModal from './src/components/CreateTeamModal';

const TestModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenModal = () => {
    console.log('Opening modal');
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalVisible(false);
  };

  const handleSaveTeam = (team) => {
    console.log('Team saved:', team);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal Test</Text>
      <Button title="Open Modal" onPress={handleOpenModal} />
      
      <CreateTeamModal 
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveTeam}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default TestModal;
