import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, LoadingOverlay, Button } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { HomePresenter, HomeViewCallbacks } from '@/src/presenters';
import { PointsBalance, Member } from '@/src/models';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { member, isAuthenticated, isLoading: authLoading } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [displayedMember, setDisplayedMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callbacks: HomeViewCallbacks = useMemo(() => ({
    showLoading: () => setIsLoading(true),
    hideLoading: () => {
      setIsLoading(false);
      setIsRefreshing(false);
    },
    showError: (message: string) => setError(t(message) || message),
    renderPoints: (balance: PointsBalance) => setPointsBalance(balance),
    renderMember: (member: Member) => setDisplayedMember(member),
  }), [t]);

  const presenter = useMemo(() => new HomePresenter(callbacks), [callbacks]);

  useEffect(() => {
    if (member && isAuthenticated) {
      setIsLoading(true);
      presenter.loadHomeData(member);
    }
  }, [member, isAuthenticated, presenter]);

  const handleRefresh = useCallback(() => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    if (member) {
      presenter.loadHomeData(member);
    }
  }, [member, presenter, isAuthenticated]);

  const handleLoginPress = () => {
    router.push('/(auth)/login' as any);
  };

  if (authLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!isAuthenticated) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.guestContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/baleno-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <ThemedText style={styles.guestTitle}>{t('home.welcomeGuest')}</ThemedText>
        <ThemedText style={styles.guestSubtitle}>{t('home.guestMessage')}</ThemedText>
        
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Ionicons name="star" size={24} color="#F59E0B" />
            <ThemedText style={styles.benefitText}>{t('home.benefit1')}</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="gift" size={24} color="#E31837" />
            <ThemedText style={styles.benefitText}>{t('home.benefit2')}</ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="notifications" size={24} color="#3B82F6" />
            <ThemedText style={styles.benefitText}>{t('home.benefit3')}</ThemedText>
          </View>
        </View>

        <Button 
          title={t('home.loginOrRegister')}
          onPress={handleLoginPress}
          style={styles.loginButton}
        />
      </ScrollView>
    );
  }

  if (isLoading && !pointsBalance) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={isRefreshing} 
          onRefresh={handleRefresh}
          tintColor="#E31837"
          colors={['#E31837']}
        />
      }
    >
      <View style={styles.headerWithLogo}>
        <Image 
          source={require('@/assets/images/baleno-logo.png')} 
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.header}>
        <ThemedText type="title" style={styles.welcomeText}>
          {t('home.welcome')}, {displayedMember?.name || member?.name || 'Member'}
        </ThemedText>
      </View>

      <Card style={styles.pointsCard} variant="elevated">
        <View style={styles.pointsHeader}>
          <Ionicons name="star" size={32} color="#F59E0B" />
          <ThemedText style={styles.pointsLabel}>{t('home.currentPoints')}</ThemedText>
        </View>
        <ThemedText style={styles.pointsValue}>
          {presenter.formatPoints(pointsBalance?.currentPoints || 0)}
        </ThemedText>
        
        {pointsBalance && pointsBalance.expiringPoints > 0 && (
          <View style={styles.expiringSection}>
            <Ionicons name="time-outline" size={16} color="#EF4444" />
            <ThemedText style={styles.expiringText}>
              {presenter.formatPoints(pointsBalance.expiringPoints)} {t('home.expiringPoints')}
              {pointsBalance.expiryDate && ` - ${presenter.formatDate(pointsBalance.expiryDate)}`}
            </ThemedText>
          </View>
        )}
      </Card>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/points' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="receipt-outline" size={28} color="#E31837" />
          </View>
          <ThemedText style={styles.actionText}>{t('home.viewHistory')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/coupons' as any)}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="gift-outline" size={28} color="#F59E0B" />
          </View>
          <ThemedText style={styles.actionText}>{t('home.viewCoupons')}</ThemedText>
        </TouchableOpacity>
      </View>


      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  guestContent: {
    padding: 24,
    paddingTop: 80,
    alignItems: 'center',
    flexGrow: 1,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 180,
    height: 60,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  headerWithLogo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  loginButton: {
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  pointsCard: {
    marginBottom: 24,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pointsLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginVertical: 8,
  },
  expiringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expiringText: {
    fontSize: 14,
    color: '#EF4444',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
});
