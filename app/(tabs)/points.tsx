import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, LoadingOverlay } from '@/src/components';
import { pointsService } from '@/src/services';
import { PointsBalance, Transaction } from '@/src/models';

export default function PointsScreen() {
  const { t } = useTranslation();
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
      }

      const [balanceResponse, transactionsResponse] = await Promise.all([
        pointsService.getPointsBalance(),
        pointsService.getTransactionHistory({ page: refresh ? 1 : page, pageSize: 20 }),
      ]);

      if (balanceResponse.success && balanceResponse.data) {
        setPointsBalance(balanceResponse.data);
      }

      if (transactionsResponse.success && transactionsResponse.data) {
        const newTransactions = transactionsResponse.data.transactions;
        if (refresh) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }
        setHasMore(newTransactions.length === 20);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    loadData(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(true);
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
      loadData(false);
    }
  }, [hasMore, isLoading, loadData]);

  const formatPoints = (points: number) => {
    const sign = points >= 0 ? '+' : '';
    return `${sign}${points.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    const labels: Record<Transaction['type'], string> = {
      earn: t('points.earn'),
      redeem: t('points.redeem'),
      expire: t('points.expire'),
      adjust: t('points.adjust'),
    };
    return labels[type];
  };

  const getTransactionColor = (type: Transaction['type']) => {
    const colors: Record<Transaction['type'], string> = {
      earn: '#22C55E',
      redeem: '#F97316',
      expire: '#EF4444',
      adjust: '#6B7280',
    };
    return colors[type];
  };

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
        <View style={[styles.iconContainer, { backgroundColor: `${getTransactionColor(item.type)}20` }]}>
          <Ionicons 
            name={getTransactionIcon(item.type)} 
            size={20} 
            color={getTransactionColor(item.type)} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <ThemedText style={styles.transactionDescription}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>
            {formatDate(item.date)}
          </ThemedText>
          {item.storeLocation && (
            <ThemedText style={styles.transactionLocation}>
              {item.storeLocation}
            </ThemedText>
          )}
        </View>
        <View style={styles.transactionPoints}>
          <ThemedText style={[styles.pointsAmount, { color: getTransactionColor(item.type) }]}>
            {formatPoints(item.points)}
          </ThemedText>
          <ThemedText style={[styles.typeLabel, { color: getTransactionColor(item.type) }]}>
            {getTransactionTypeLabel(item.type)}
          </ThemedText>
        </View>
      </View>
    </Card>
  );

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
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>{t('home.currentPoints')}</ThemedText>
              <ThemedText style={styles.balanceValue}>
                {pointsBalance.currentPoints.toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <ThemedText style={styles.balanceLabel}>{t('points.lifetimePoints')}</ThemedText>
              <ThemedText style={styles.balanceValue}>
                {pointsBalance.lifetimePoints.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </Card>
      )}

      <ThemedText style={styles.sectionTitle}>{t('points.history')}</ThemedText>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
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
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
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
    padding: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
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
    fontSize: 16,
    fontWeight: '600',
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '500',
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
});
