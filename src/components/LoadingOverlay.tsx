import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { useTranslation } from 'react-i18next';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { t } = useTranslation();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#E31837" />
          <ThemedText style={styles.text}>
            {message || t('common.loading')}
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#374151',
  },
});

export default LoadingOverlay;
