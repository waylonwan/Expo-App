import React, { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Platform, Alert as RNAlert } from 'react-native';
import { ThemedText } from '../../components/ThemedText';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([]);

  const showAlert = useCallback((alertTitle: string, alertMessage?: string, alertButtons?: AlertButton[]) => {
    if (Platform.OS === 'web') {
      setTitle(alertTitle);
      setMessage(alertMessage || '');
      setButtons(alertButtons || [{ text: '確定', style: 'default' }]);
      setVisible(true);
    } else {
      RNAlert.alert(alertTitle, alertMessage, alertButtons);
    }
  }, []);

  const handleButtonPress = useCallback((button: AlertButton) => {
    setVisible(false);
    if (button.onPress) {
      button.onPress();
    }
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {Platform.OS === 'web' && (
        <Modal
          transparent
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}
        >
          <View style={styles.overlay}>
            <View style={styles.alertContainer}>
              <ThemedText style={styles.title}>{title}</ThemedText>
              {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                  >
                    <ThemedText
                      style={[
                        styles.buttonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                      ]}
                    >
                      {button.text}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    minWidth: 270,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E31837',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#374151',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  destructiveButtonText: {
    color: '#FFFFFF',
  },
});

export default AlertProvider;
