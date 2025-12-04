import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Card, Button, LoadingOverlay } from '@/src/components';
import { useAuth } from '@/src/contexts';
import { couponService } from '@/src/services';
import { Coupon, RedeemCouponResponse } from '@/src/models';

export default function CouponsScreen() {
  const { t } = useTranslation();
  const { member } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'available' | 'redeemed'>('available');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<RedeemCouponResponse | null>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      const response = selectedTab === 'available' 
        ? await couponService.getAvailableCoupons()
        : await couponService.getRedeemedCoupons();

      if (response.success && response.data) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    setIsLoading(true);
    loadCoupons();
  }, [selectedTab, loadCoupons]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadCoupons();
  }, [loadCoupons]);

  const handleRedeemPress = useCallback((coupon: Coupon) => {
    Alert.alert(
      t('coupons.confirmRedeem'),
      t('coupons.confirmRedeemMessage', { points: coupon.pointsCost.toLocaleString() }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            if (!member) return;

            setIsLoading(true);
            try {
              const response = await couponService.redeemCoupon({
                memberId: member.id,
                couponId: coupon.id,
              });

              if (response.success && response.data) {
                setRedemptionResult(response.data);
                setSelectedCoupon(coupon);
                setShowRedemptionModal(true);
                loadCoupons();
              } else {
                Alert.alert(t('common.error'), response.error?.message || t('coupons.redeemFailed'));
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('coupons.redeemFailed'));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  }, [member, t, loadCoupons]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: Coupon['category']) => {
    const colors: Record<Coupon['category'], string> = {
      discount: '#3B82F6',
      gift: '#8B5CF6',
      special: '#F59E0B',
      partner: '#10B981',
    };
    return colors[category];
  };

  const renderCoupon = ({ item }: { item: Coupon }) => (
    <Card style={styles.couponCard} variant="elevated">
      <View style={styles.couponHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
          <ThemedText style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText style={styles.expiryDate}>
          {t('coupons.expiryDate')}: {formatDate(item.expiryDate)}
        </ThemedText>
      </View>

      <ThemedText style={styles.couponTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.couponDescription}>{item.description}</ThemedText>

      <View style={styles.couponFooter}>
        <View style={styles.pointsCost}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <ThemedText style={styles.pointsText}>
            {item.pointsCost.toLocaleString()} {t('coupons.pointsCost')}
          </ThemedText>
        </View>

        {selectedTab === 'available' ? (
          <Button
            title={t('coupons.redeem')}
            onPress={() => handleRedeemPress(item)}
            size="small"
          />
        ) : item.redemptionCode ? (
          <TouchableOpacity 
            style={styles.showCodeButton}
            onPress={() => {
              setSelectedCoupon(item);
              setRedemptionResult({
                success: true,
                redemptionCode: item.redemptionCode!,
                qrCodeUrl: item.qrCodeUrl,
                message: '',
                redeemedAt: '',
              });
              setShowRedemptionModal(true);
            }}
          >
            <ThemedText style={styles.showCodeText}>{t('coupons.showCode')}</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );

  if (isLoading && coupons.length === 0) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>{t('coupons.title')}</ThemedText>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'available' && styles.tabActive]}
          onPress={() => setSelectedTab('available')}
        >
          <ThemedText style={[styles.tabText, selectedTab === 'available' && styles.tabTextActive]}>
            {t('coupons.available')}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'redeemed' && styles.tabActive]}
          onPress={() => setSelectedTab('redeemed')}
        >
          <ThemedText style={[styles.tabText, selectedTab === 'redeemed' && styles.tabTextActive]}>
            {t('coupons.redeemed')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={coupons}
        renderItem={renderCoupon}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="gift-outline" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>{t('coupons.noCoupons')}</ThemedText>
          </View>
        }
      />

      <Modal
        visible={showRedemptionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRedemptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRedemptionModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            </View>

            <ThemedText style={styles.modalTitle}>
              {selectedCoupon?.title}
            </ThemedText>

            {redemptionResult && (
              <>
                <ThemedText style={styles.codeLabel}>{t('coupons.redemptionCode')}</ThemedText>
                <View style={styles.codeContainer}>
                  <ThemedText style={styles.codeText}>
                    {redemptionResult.redemptionCode}
                  </ThemedText>
                </View>

                {redemptionResult.qrCodeUrl && (
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code" size={120} color="#111827" />
                    <ThemedText style={styles.scanText}>{t('coupons.scanQR')}</ThemedText>
                  </View>
                )}
              </>
            )}

            <Button
              title={t('common.close')}
              onPress={() => setShowRedemptionModal(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={isLoading && coupons.length > 0} />
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  couponCard: {
    marginBottom: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expiryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  couponDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pointsCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  showCodeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  showCodeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  successIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  codeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 2,
  },
  qrPlaceholder: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scanText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  modalButton: {
    width: '100%',
  },
});
