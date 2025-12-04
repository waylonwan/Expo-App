import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, LoadingOverlay } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { pointsService } from '@/src/services';
import { PointsBalance } from '@/src/models';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { member } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await pointsService.getPointsBalance();
      if (response.success && response.data) {
        setPointsBalance(response.data);
      }
    } catch (error) {
      console.error('Error loading points:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const formatPoints = (points: number) => points.toLocaleString();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      standard: '#6B7280',
      silver: '#9CA3AF',
      gold: '#F59E0B',
      platinum: '#8B5CF6',
    };
    return colors[tier] || '#6B7280';
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <ThemedText type="title" style={styles.welcomeText}>
          {t('home.welcome')}, {member?.name || 'Member'}
        </ThemedText>
        {member && (
          <View style={[styles.tierBadge, { backgroundColor: getTierColor(member.membershipTier) }]}>
            <ThemedText style={styles.tierText}>
              {member.membershipTier.toUpperCase()}
            </ThemedText>
          </View>
        )}
      </View>

      <Card style={styles.pointsCard} variant="elevated">
        <View style={styles.pointsHeader}>
          <Ionicons name="star" size={32} color="#F59E0B" />
          <ThemedText style={styles.pointsLabel}>{t('home.currentPoints')}</ThemedText>
        </View>
        <ThemedText style={styles.pointsValue}>
          {formatPoints(pointsBalance?.currentPoints || 0)}
        </ThemedText>
        
        {pointsBalance && pointsBalance.expiringPoints > 0 && (
          <View style={styles.expiringSection}>
            <Ionicons name="time-outline" size={16} color="#EF4444" />
            <ThemedText style={styles.expiringText}>
              {formatPoints(pointsBalance.expiringPoints)} {t('home.expiringPoints')}
              {pointsBalance.expiryDate && ` - ${formatDate(pointsBalance.expiryDate)}`}
            </ThemedText>
          </View>
        )}
      </Card>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/points')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="receipt-outline" size={28} color="#3B82F6" />
          </View>
          <ThemedText style={styles.actionText}>{t('home.viewHistory')}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/coupons')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="gift-outline" size={28} color="#F59E0B" />
          </View>
          <ThemedText style={styles.actionText}>{t('home.viewCoupons')}</ThemedText>
        </TouchableOpacity>
      </View>

      {member && (
        <Card style={styles.memberCard}>
          <View style={styles.memberInfo}>
            <View style={styles.memberRow}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <ThemedText style={styles.memberLabel}>{t('auth.email')}</ThemedText>
              <ThemedText style={styles.memberValue}>{member.email}</ThemedText>
            </View>
            {member.phone && (
              <View style={styles.memberRow}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <ThemedText style={styles.memberLabel}>{t('auth.phone')}</ThemedText>
                <ThemedText style={styles.memberValue}>{member.phone}</ThemedText>
              </View>
            )}
            <View style={styles.memberRow}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <ThemedText style={styles.memberLabel}>{t('home.memberSince')}</ThemedText>
              <ThemedText style={styles.memberValue}>{formatDate(member.joinDate)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.lifetimePoints}>
            <ThemedText style={styles.lifetimeLabel}>{t('points.lifetimePoints')}</ThemedText>
            <ThemedText style={styles.lifetimeValue}>
              {formatPoints(pointsBalance?.lifetimePoints || 0)}
            </ThemedText>
          </View>
        </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tierText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  memberCard: {
    marginBottom: 24,
  },
  memberInfo: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
  },
  memberValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  lifetimePoints: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lifetimeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  lifetimeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
