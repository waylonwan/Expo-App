import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, LoadingOverlay } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { PointsPresenter, PointsViewCallbacks } from '@/src/presenters';
import { PointsBalance, Transaction } from '@/src/models';

export default function PointsScreen() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const callbacks: PointsViewCallbacks = useMemo(() => ({
    showLoading: () => setIsLoading(true),
    hideLoading: () => {
      setIsLoading(false);
      setIsRefreshing(false);
    },
    showError: (message: string) => setError(t(message) || message),
    renderBalance: (balance: PointsBalance) => setPointsBalance(balance),
    renderTransactions: (txns: Transaction[], hasMorePages: boolean) => {
      setTransactions(txns);
      setHasMore(hasMorePages);
    },
    appendTransactions: (txns: Transaction[], hasMorePages: boolean) => {
      setTransactions(prev => [...prev, ...txns]);
      setHasMore(hasMorePages);
    },
  }), [t]);

  const presenter = useMemo(() => new PointsPresenter(callbacks), [callbacks]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      presenter.refresh();
    }
  }, [presenter, isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    presenter.refresh();
  }, [presenter]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      presenter.loadMore();
    }
  }, [hasMore, isLoading, presenter]);

  const getTransactionIcon = (type: Transaction['type']) => {
    const icons: Record<Transaction['type'], string> = {
      earn: 'add-circle',
      redeem: 'gift',
      expire: 'time',
      adjust: 'swap-horizontal',
    };
    return icons[type] as any;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard} variant="outlined">
      <View style={styles.transactionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${presenter.getTransactionColor(item.type)}20` }]}>
          <Ionicons 
            name={getTransactionIcon(item.type)} 
            size={20} 
            color={presenter.getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.transactionDescription}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>
            {presenter.formatDate(item.date)}
          </ThemedText>
          {item.storeLocation && (
            <ThemedText style={styles.transactionLocation}>
              {item.storeLocation}
            </ThemedText>
          )}
        </View>
        <View style={styles.transactionPoints}>
          <ThemedText style={[styles.pointsAmount, { color: presenter.getTransactionColor(item.type) }]}>
            {presenter.formatPoints(item.points)}
          </ThemedText>
          <ThemedText style={[styles.typeLabel, { color: presenter.getTransactionColor(item.type) }]}>
            {t(presenter.getTransactionTypeKey(item.type))}
          </ThemedText>
        </View>
      </View>
    </Card>
  );

  // 未登入時不渲染任何內容（useEffect 會處理跳轉）
  if (!isAuthenticated) {
    return null;
  }

  if (isLoading && transactions.length === 0) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t('points.title')}</ThemedText>
      </View>

      {pointsBalance && (
        <Card style={styles.balanceCard} variant="elevated">
          <View style={styles.balanceHeader}>
            <Ionicons name="star" size={28} color="#F59E0B" />
            <ThemedText style={styles.balanceLabel}>{t('points.balance')}</ThemedText>
          </View>
          <Text style={styles.balanceValue}>
            {presenter.formatBalance(pointsBalance.currentPoints)}
          </Text>
        </Card>
      )}

      <ThemedText style={styles.sectionTitle}>{t('points.history')}</ThemedText>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#E31837" colors={['#E31837']} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>{t('points.noTransactions')}</ThemedText>
          </View>
        }
      />

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionPoints: {
    alignItems: 'flex-end',
  },
  pointsAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  typeLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    padding: 16,
  },
});
