import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Rewards = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(150);
  const [userName, setUserName] = useState('User');
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [showMyCodes, setShowMyCodes] = useState(false);
  const [myCodes, setMyCodes] = useState([]);
  const [showShopItemModal, setShowShopItemModal] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState(null);
  const [loginStreak, setLoginStreak] = useState(0);

  useEffect(() => {
    loadRewardsData();
    checkDailyLogin();
  }, [user]);

  const loadRewardsData = async () => {
    try {
      const storedUserName = user?.name || await AsyncStorage.getItem('userName') || 'User';
      const storedPoints = await AsyncStorage.getItem('userPoints') || '150';
      const storedClaimedRewards = JSON.parse(await AsyncStorage.getItem('claimedRewards') || '[]');
      const storedRedemptions = JSON.parse(await AsyncStorage.getItem('rewardRedemptions') || '[]');
      const storedCodes = JSON.parse(await AsyncStorage.getItem('discountCodes') || '[]');

      setUserName(storedUserName);
      setUserPoints(parseInt(storedPoints));
      setClaimedRewards(storedClaimedRewards);
      setRedemptionHistory(storedRedemptions);
      setMyCodes(storedCodes);
      
      // Load login streak
      const storedStreak = await getLoginStreak();
      setLoginStreak(storedStreak);
    } catch (error) {
      console.error('Error loading rewards data:', error);
    }
  };

  // Check and update login streak
  const checkDailyLogin = async () => {
    const today = new Date().toDateString();
    const lastLogin = await AsyncStorage.getItem('lastLoginDate');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin !== today) {
      // Check if login streak should continue or reset
      if (lastLogin === yesterday.toDateString()) {
        // Consecutive day, maintain streak
        const currentStreak = await getLoginStreak();
        await AsyncStorage.setItem('loginStreak', (currentStreak + 1).toString());
      } else if (lastLogin && lastLogin !== yesterday.toDateString()) {
        // Missed a day, reset streak
        await AsyncStorage.setItem('loginStreak', '1');
      } else if (!lastLogin) {
        // First time login
        await AsyncStorage.setItem('loginStreak', '1');
      }

      // Update last login date
      await AsyncStorage.setItem('lastLoginDate', today);
    }
  };

  // Check if user has logged in today
  const hasLoggedInToday = async () => {
    const lastLogin = await AsyncStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();
    return lastLogin === today;
  };

  // Check login streak
  const getLoginStreak = async () => {
    return parseInt(await AsyncStorage.getItem('loginStreak') || '0');
  };

  // Check last monthly pic upload
  const getLastPicUpload = async () => {
    const lastUpload = await AsyncStorage.getItem('lastPicUpload');
    return lastUpload ? new Date(lastUpload) : null;
  };

  // Check if monthly pic is due
  const isPicUploadDue = async () => {
    const lastUpload = await getLastPicUpload();
    if (!lastUpload) return true;
    const now = new Date();
    const daysSinceUpload = Math.floor((now - lastUpload) / (1000 * 60 * 60 * 24));
    return daysSinceUpload >= 30;
  };

  // Get referral count
  const getReferralCount = async () => {
    return parseInt(await AsyncStorage.getItem('referralCount') || '0');
  };

  // Reward categories - exactly matching the web version
  const getRewardCategories = async () => {
    const loginStreak = await getLoginStreak();
    const loggedInToday = await hasLoggedInToday();
    const picUploadDue = await isPicUploadDue();
    const referralCount = await getReferralCount();

    return [
      {
        id: 'daily',
        title: 'Daily Login Rewards',
        icon: '📅',
        rewards: [
          {
            id: 1,
            title: 'Daily Login Bonus',
            points: 10,
            claimed: loggedInToday,
            type: 'daily',
            description: 'Login every day to earn points'
          },
          {
            id: 2,
            title: '7-Day Login Streak',
            points: 50,
            claimed: loginStreak >= 7,
            type: 'streak',
            description: `Current streak: ${loginStreak} days`
          },
          {
            id: 3,
            title: '30-Day Login Streak',
            points: 500,
            claimed: loginStreak >= 30,
            type: 'streak',
            description: `Current streak: ${loginStreak} days`
          }
        ]
      },
      {
        id: 'monthly',
        title: 'Monthly Progress Photos',
        icon: '📸',
        rewards: [
          {
            id: 4,
            title: 'Upload Monthly Progress Photo',
            points: 200,
            claimed: !picUploadDue,
            type: 'monthly',
            description: 'Upload your monthly transformation photo',
            action: 'upload'
          },
          {
            id: 5,
            title: '3-Month Photo Consistency',
            points: 750,
            claimed: false,
            type: 'consistency',
            description: 'Upload photos for 3 consecutive months'
          }
        ]
      },
      {
        id: 'referral',
        title: 'Referral Program',
        icon: '👥',
        rewards: [
          {
            id: 7,
            title: 'Refer a Friend',
            points: 300,
            claimed: false,
            type: 'referral',
            description: 'Invite friends to join FitCoach AI',
            action: 'refer'
          },
          {
            id: 8,
            title: '5 Successful Referrals',
            points: 1000,
            claimed: referralCount >= 5,
            type: 'referral_milestone',
            description: `Current referrals: ${referralCount}/5`
          },
          {
            id: 9,
            title: '10 Referral Champion',
            points: 2000,
            claimed: referralCount >= 10,
            type: 'referral_champion',
            description: `Current referrals: ${referralCount}/10`
          }
        ]
      }
    ];
  };

  // Discount codes that can be redeemed for official website
  const discountCodes = [
    { id: 'discount10', name: '10% Off Discount Code', cost: 1000, discount: 10, icon: '🎫', description: 'Get 10% off on official FitCoach products' },
    { id: 'discount15', name: '15% Off Discount Code', cost: 1500, discount: 15, icon: '🎟️', description: 'Get 15% off on official FitCoach products' },
    { id: 'discount20', name: '20% Off Discount Code', cost: 2000, discount: 20, icon: '🏷️', description: 'Get 20% off on official FitCoach products' },
    { id: 'discount25', name: '25% Off Discount Code', cost: 2500, discount: 25, icon: '💳', description: 'Get 25% off on official FitCoach products' },
    { id: 'discount30', name: '30% Off Discount Code', cost: 3000, discount: 30, icon: '🎁', description: 'Get 30% off on official FitCoach products' }
  ];

  // Shop items that can be purchased with points
  const shopCategories = [
    {
      id: 'supplements',
      title: 'Supplements & Nutrition',
      icon: '💊',
      items: [
        { id: 1, name: 'FitCoach Premium (1 Month)', cost: 2500, icon: '🎯', description: '1-month premium app access coupon' },
        { id: 2, name: 'Optimum Nutrition 20% Off', cost: 3000, icon: '🥤', description: 'Discount on whey protein & supplements' },
        { id: 3, name: 'Dymatize ISO100 Coupon', cost: 5050, icon: '💪', description: '15% off premium whey isolate' },
        { id: 4, name: 'BSN Supplements Deal', cost: 2000, icon: '⚡', description: '25% off pre-workout & creatine' },
        { id: 5, name: 'MuscleTech Bundle Offer', cost: 3500, icon: '🔥', description: '30% off protein + pre-workout combo' },
        { id: 6, name: 'Cellucor C4 Energy Discount', cost: 1500, icon: '⚡', description: '20% off C4 pre-workout series' },
        { id: 7, name: 'Quest Nutrition Bars', cost: 2000, icon: '🍫', description: '15% off protein bars & snacks' }
      ]
    },
    {
      id: 'fitness',
      title: 'Fitness & Equipment',
      icon: '🏋️',
      items: [
        { id: 8, name: 'Nike Training Gear 15% Off', cost: 4000, icon: '👟', description: 'Discount on Nike fitness apparel' },
        { id: 9, name: 'Adidas Workout Clothes', cost: 3500, icon: '👕', description: '20% off Adidas activewear' },
        { id: 10, name: 'Under Armour Gear Deal', cost: 3000, icon: '🎽', description: '25% off UA performance wear' },
        { id: 11, name: 'Bowflex Equipment Coupon', cost: 5000, icon: '🏋️', description: '$100 off home gym equipment' },
        { id: 12, name: 'Resistance Bands Set', cost: 1200, icon: '🔗', description: 'Free premium resistance band set' },
        { id: 13, name: 'Yoga Mat Premium', cost: 1000, icon: '🧘', description: 'High-quality eco-friendly yoga mat' }
      ]
    }
  ];

  const claimReward = async (reward) => {
    if (!claimedRewards.includes(reward.id)) {
      const newPoints = userPoints + reward.points;
      const newClaimedRewards = [...claimedRewards, reward.id];

      setUserPoints(newPoints);
      setClaimedRewards(newClaimedRewards);

      // Save to AsyncStorage
      await AsyncStorage.setItem('userPoints', newPoints.toString());
      await AsyncStorage.setItem('claimedRewards', JSON.stringify(newClaimedRewards));

      // Handle daily login
      if (reward.type === 'daily') {
        const today = new Date().toDateString();
        await AsyncStorage.setItem('lastLoginDate', today);
        // Update login streak
        const currentStreak = await getLoginStreak();
        await AsyncStorage.setItem('loginStreak', (currentStreak + 1).toString());
      }

      Alert.alert('Reward Claimed!', `You earned ${reward.points} points! 🎉`);
    }
  };

  const handlePhotoUpload = () => {
    Alert.alert(
      'Upload Progress Photo',
      'This would open the camera/gallery to upload your progress photo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upload Photo',
          onPress: async () => {
            // Save upload date
            const today = new Date().toISOString();
            await AsyncStorage.setItem('lastPicUpload', today);

            // Award points
            const newPoints = userPoints + 200;
            setUserPoints(newPoints);
            await AsyncStorage.setItem('userPoints', newPoints.toString());

            // Mark as claimed
            const newClaimedRewards = [...claimedRewards, 4];
            setClaimedRewards(newClaimedRewards);
            await AsyncStorage.setItem('claimedRewards', JSON.stringify(newClaimedRewards));

            Alert.alert('Photo uploaded successfully! +200 points earned!');
          }
        }
      ]
    );
  };

  const handleReferral = async () => {
    const referralCode = `FITCOACH${userName.toUpperCase()}${Math.random().toString(36).substring(2, 6)}`;
    const referralLink = `https://fitcoach.ai/join?ref=${referralCode}`;

    // Copy to clipboard (simulated for demo)
    // In a real app, you would use expo-clipboard or @react-native-clipboard/clipboard

    Alert.alert(
      'Referral Link Copied!',
      `Share this link: ${referralLink}\n\nYou'll earn 300 points for each friend who joins!`,
      [
        { text: 'OK' },
        { text: 'Share Link', onPress: () => {
          // This would open share dialog in a real app
          Alert.alert('Share', 'This would open the share dialog');
        }}
      ]
    );

    // For demo purposes, simulate a referral
    const currentReferrals = await getReferralCount();
    await AsyncStorage.setItem('referralCount', (currentReferrals + 1).toString());

    // Award points
    const newPoints = userPoints + 300;
    setUserPoints(newPoints);
    await AsyncStorage.setItem('userPoints', newPoints.toString());
  };

  const purchaseItem = async (item) => {
    if (userPoints >= item.cost) {
      Alert.alert(
        'Confirm Purchase',
        `Are you sure you want to redeem ${item.name} for ${item.cost} points?\n\nYour current balance: ${userPoints} points\nAfter purchase: ${userPoints - item.cost} points`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              const newPoints = userPoints - item.cost;
              setUserPoints(newPoints);
              await AsyncStorage.setItem('userPoints', newPoints.toString());

              // Generate coupon code for the item
              const couponCode = `${item.name.replace(/\s+/g, '').toUpperCase().substring(0, 8)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

              // Create purchased item with coupon
              const purchasedItemData = {
                ...item,
                couponCode: couponCode,
                purchaseDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
                pointsSpent: item.cost
              };

              // Add to purchase history
              const purchase = {
                id: Date.now(),
                item: purchasedItemData,
                cost: item.cost,
                date: new Date().toISOString(),
                type: 'redemption'
              };

              const existingHistory = redemptionHistory;
              const newHistory = [purchase, ...existingHistory];
              await AsyncStorage.setItem('rewardRedemptions', JSON.stringify(newHistory));
              setRedemptionHistory(newHistory);

              // Show the purchased item modal
              setPurchasedItem(purchasedItemData);
              setShowShopItemModal(true);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Insufficient Points!',
        `You need ${item.cost - userPoints} more points to redeem this item.\nCurrent balance: ${userPoints} points`
      );
    }
  };

  const generateDiscountCode = async (discountItem) => {
    if (userPoints >= discountItem.cost) {
      Alert.alert(
        'Confirm Purchase',
        `Are you sure you want to redeem ${discountItem.name} for ${discountItem.cost} points?\n\nYour current balance: ${userPoints} points\nAfter purchase: ${userPoints - discountItem.cost} points`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              const newPoints = userPoints - discountItem.cost;
              setUserPoints(newPoints);
              await AsyncStorage.setItem('userPoints', newPoints.toString());

              // Generate unique discount code
              const codePrefix = `FITCOACH${discountItem.discount}`;
              const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
              const discountCode = `${codePrefix}-${randomSuffix}`;

              // Create code object with details
              const codeData = {
                code: discountCode,
                discount: discountItem.discount,
                name: discountItem.name,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                used: false
              };

              // Save to AsyncStorage
              const existingCodes = myCodes;
              const newCodes = [codeData, ...existingCodes];
              await AsyncStorage.setItem('discountCodes', JSON.stringify(newCodes));
              setMyCodes(newCodes);

              // Add to purchase history
              const purchase = {
                id: Date.now(),
                item: { ...discountItem, code: discountCode },
                cost: discountItem.cost,
                date: new Date().toISOString(),
                type: 'discount_code'
              };

              const existingHistory = redemptionHistory;
              const newHistory = [purchase, ...existingHistory];
              await AsyncStorage.setItem('rewardRedemptions', JSON.stringify(newHistory));
              setRedemptionHistory(newHistory);

              // Show the generated code
              setGeneratedCode(codeData);
              setShowDiscountModal(true);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Insufficient Points!',
        `You need ${discountItem.cost - userPoints} more points to redeem this discount code.\nCurrent balance: ${userPoints} points`
      );
    }
  };

  const copyCodeToClipboard = (code) => {
    // Simulated clipboard copy for demo
    // In a real app, you would use expo-clipboard or @react-native-clipboard/clipboard
    Alert.alert('Code Ready!', `Your code: ${code}\n\nIn a real app, this would be copied to your clipboard automatically.`);
  };

  const getPointsColor = (points) => {
    if (points >= 1000) return theme.colors.error;
    if (points >= 500) return theme.colors.info;
    if (points >= 100) return theme.colors.success;
    return theme.colors.warning;
  };

  const [rewardCategories, setRewardCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getRewardCategories();
      setRewardCategories(categories);
    };
    loadCategories();
  }, [userPoints, claimedRewards, loginStreak]);

  const styles = createStyles(theme);

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowMyCodes(true)} style={styles.headerButton}>
            <Ionicons name="pricetag" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerButton}>
            <Ionicons name="time" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Display */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsContent}>
            <Text style={styles.greeting}>Hey {userName}!</Text>
            <Text style={styles.points}>{userPoints.toLocaleString()} points</Text>
          </View>
          <Text style={styles.pointsEmoji}>🏅</Text>
        </View>

        {/* Daily Streak Display */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>Daily Streak</Text>
              <Text style={styles.streakSubtitle}>Keep it going!</Text>
            </View>
          </View>
          <View style={styles.streakRight}>
            <Text style={styles.streakNumber}>{loginStreak}</Text>
            <Text style={styles.streakDays}>{loginStreak === 1 ? 'day' : 'days'}</Text>
          </View>
        </View>

        {/* Streak Achievements */}
        <View style={styles.streakAchievements}>
          {[7, 14, 30, 60, 100].map((milestone) => (
            <View
              key={milestone}
              style={[
                styles.streakMilestone,
                loginStreak >= milestone && styles.streakMilestoneActive
              ]}
            >
              <Text style={[
                styles.streakMilestoneText,
                loginStreak >= milestone && styles.streakMilestoneTextActive
              ]}>
                {milestone >= 100 ? '💯' : milestone >= 60 ? '🏆' : milestone >= 30 ? '🥇' : milestone >= 14 ? '🥈' : '🥉'}
              </Text>
            </View>
          ))}
        </View>

        {/* Streak Message */}
        {loginStreak > 0 && (
          <View style={styles.streakMessage}>
            <Text style={styles.streakMessageText}>
              {loginStreak >= 100 ? '🎉 Incredible! You\'re a fitness legend!' :
               loginStreak >= 60 ? '🔥 Amazing streak! You\'re unstoppable!' :
               loginStreak >= 30 ? '💪 One month strong! Keep crushing it!' :
               loginStreak >= 14 ? '⭐ Two weeks in a row! You\'re on fire!' :
               loginStreak >= 7 ? '🚀 One week streak! Great momentum!' :
               loginStreak >= 3 ? '✨ Building a habit! Keep it up!' :
               '🌟 Great start! Come back tomorrow!'}
            </Text>
          </View>
        )}

        {/* Reward Categories */}
        {rewardCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>

            {category.rewards.map((reward) => {
              const isClaimed = claimedRewards.includes(reward.id) || reward.claimed;
              return (
                <View
                  key={reward.id}
                  style={[styles.rewardCard, isClaimed && styles.rewardCardClaimed]}
                >
                  <View style={styles.rewardContent}>
                    <View style={[styles.rewardStatus, isClaimed && styles.rewardStatusClaimed]}>
                      {isClaimed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                    </View>
                    <View style={styles.rewardInfo}>
                      <Text style={[styles.rewardTitle, isClaimed && styles.rewardTitleClaimed]}>
                        {reward.title}
                      </Text>
                      <Text style={[styles.rewardPoints, { color: getPointsColor(reward.points) }]}>
                        +{reward.points} points
                      </Text>
                      {reward.description && (
                        <Text style={styles.rewardDescription}>{reward.description}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.rewardAction}>
                    {!isClaimed && reward.action === 'upload' && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handlePhotoUpload}
                      >
                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Upload</Text>
                      </TouchableOpacity>
                    )}
                    {!isClaimed && reward.action === 'refer' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
                        onPress={handleReferral}
                      >
                        <Ionicons name="share" size={16} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Share</Text>
                      </TouchableOpacity>
                    )}
                    {!isClaimed && !reward.action && (
                      <TouchableOpacity
                        style={styles.claimButton}
                        onPress={() => claimReward(reward)}
                      >
                        <Text style={styles.claimButtonText}>Claim</Text>
                      </TouchableOpacity>
                    )}
                    {isClaimed && (
                      <View style={styles.claimedContainer}>
                        <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                        <Text style={styles.claimedText}>Claimed</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Official Website Discount Codes */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryEmoji}>🎫</Text>
            <Text style={styles.categoryTitle}>Official Website Discount Codes</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={theme.colors.info} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoText}>
                Redeem points for discount codes that can be used on our official website. Each code is valid for 30 days and can be used once.
              </Text>
            </View>
          </View>

          {discountCodes.map((discountItem) => (
            <TouchableOpacity
              key={discountItem.id}
              style={styles.discountCard}
              onPress={() => generateDiscountCode(discountItem)}
            >
              <View style={styles.discountContent}>
                <Text style={styles.discountEmoji}>{discountItem.icon}</Text>
                <View style={styles.discountInfo}>
                  <Text style={styles.discountName}>{discountItem.name}</Text>
                  <Text style={styles.discountDescription}>{discountItem.description}</Text>
                  <View style={styles.discountBadgeContainer}>
                    <Text style={styles.discountBadge}>{discountItem.discount}% OFF</Text>
                  </View>
                </View>
              </View>
              <View style={styles.discountAction}>
                <Text style={styles.discountCost}>{discountItem.cost} pts</Text>
                <TouchableOpacity
                  style={[
                    styles.discountButton,
                    userPoints < discountItem.cost && styles.discountButtonDisabled
                  ]}
                  onPress={() => generateDiscountCode(discountItem)}
                  disabled={userPoints < discountItem.cost}
                >
                  <Text style={[
                    styles.discountButtonText,
                    userPoints < discountItem.cost && styles.discountButtonTextDisabled
                  ]}>
                    {userPoints >= discountItem.cost ? 'Redeem Code' : 'Need more pts'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Points Shop */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryEmoji}>🛍️</Text>
            <Text style={styles.categoryTitle}>Points Shop</Text>
          </View>

          {shopCategories.map((category) => (
            <View key={category.id} style={styles.shopCategory}>
              <View style={styles.shopCategoryHeader}>
                <Text style={styles.shopCategoryEmoji}>{category.icon}</Text>
                <Text style={styles.shopCategoryTitle}>{category.title}</Text>
              </View>

              {category.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.shopItem}
                  onPress={() => purchaseItem(item)}
                >
                  <View style={styles.shopItemContent}>
                    <Text style={styles.shopItemEmoji}>{item.icon}</Text>
                    <View style={styles.shopItemInfo}>
                      <Text style={styles.shopItemName}>{item.name}</Text>
                      <Text style={styles.shopItemDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <View style={styles.shopItemAction}>
                    <Text style={styles.shopItemCost}>{item.cost} pts</Text>
                    <TouchableOpacity
                      style={[
                        styles.shopItemButton,
                        userPoints < item.cost && styles.shopItemButtonDisabled
                      ]}
                      onPress={() => purchaseItem(item)}
                      disabled={userPoints < item.cost}
                    >
                      <Text style={[
                        styles.shopItemButtonText,
                        userPoints < item.cost && styles.shopItemButtonTextDisabled
                      ]}>
                        {userPoints >= item.cost ? 'Purchase' : 'Need more pts'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Redemption History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Redemption History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {redemptionHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyTitle}>No redemptions yet</Text>
                <Text style={styles.emptyText}>Start redeeming items to see your history here</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {redemptionHistory.map((redemption) => (
                  <View key={redemption.id} style={styles.historyItem}>
                    <Text style={styles.historyEmoji}>{redemption.item.icon}</Text>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyName}>{redemption.item.name}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(redemption.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.historyCost}>-{redemption.cost} pts</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={styles.totalRedeemed}>
              Total Redeemed: {redemptionHistory.reduce((total, item) => total + item.cost, 0)} points
            </Text>
          </View>
        </View>
      </Modal>

      {/* Discount Code Modal */}
      <Modal
        visible={showDiscountModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDiscountModal(false)}
      >
        {generatedCode && (
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎉 Discount Code Generated!</Text>
              <TouchableOpacity onPress={() => setShowDiscountModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.codeContainer}>
                <Text style={styles.codeEmoji}>🎫</Text>
                <Text style={styles.codeTitle}>{generatedCode.discount}% OFF Discount Code</Text>
                <Text style={styles.codeSubtitle}>
                  Use this code on our official website to get {generatedCode.discount}% off your purchase
                </Text>
              </View>

              <View style={styles.codeDisplay}>
                <Text style={styles.codeLabel}>Your Discount Code:</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{generatedCode.code}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyCodeToClipboard(generatedCode.code)}
                >
                  <Ionicons name="copy" size={16} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copy Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.codeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Discount:</Text>
                  <Text style={styles.detailValue}>{generatedCode.discount}% OFF</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(generatedCode.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Usage:</Text>
                  <Text style={styles.detailValue}>One-time use</Text>
                </View>
              </View>

              <View style={styles.codeInstructions}>
                <Text style={styles.instructionsTitle}>How to use:</Text>
                <Text style={styles.instructionsText}>
                  1. Visit our official website: fitcoach.ai/shop{'\n'}
                  2. Add items to your cart{'\n'}
                  3. Enter this code at checkout{'\n'}
                  4. Enjoy your {generatedCode.discount}% discount!
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => {
                    Linking.openURL('https://fitcoach.ai/shop').catch(() => {
                      Alert.alert('Error', 'Could not open website');
                    });
                  }}
                >
                  <Ionicons name="open" size={16} color="#FFFFFF" />
                  <Text style={styles.shopButtonText}>Shop Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDiscountModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.saveNotice}>
                <Text style={styles.saveNoticeText}>
                  💡 Your code is automatically saved and can be viewed in your redemption history
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Shop Item Coupon Modal */}
      <Modal
        visible={showShopItemModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowShopItemModal(false)}
      >
        {purchasedItem && (
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎉 Coupon Redeemed!</Text>
              <TouchableOpacity onPress={() => setShowShopItemModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.codeContainer}>
                <Text style={styles.codeEmoji}>{purchasedItem.icon}</Text>
                <Text style={styles.codeTitle}>{purchasedItem.name}</Text>
                <Text style={styles.codeSubtitle}>{purchasedItem.description}</Text>
              </View>

              <View style={styles.codeDisplay}>
                <Text style={styles.codeLabel}>Your Coupon Code:</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{purchasedItem.couponCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyCodeToClipboard(purchasedItem.couponCode)}
                >
                  <Ionicons name="copy" size={16} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copy Coupon Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.codeDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Points Spent:</Text>
                  <Text style={[styles.detailValue, { color: theme.colors.error }]}>
                    {purchasedItem.pointsSpent} pts
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valid Until:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(purchasedItem.expiryDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Usage:</Text>
                  <Text style={styles.detailValue}>One-time use</Text>
                </View>
              </View>

              <View style={styles.codeInstructions}>
                <Text style={styles.instructionsTitle}>How to use:</Text>
                <Text style={styles.instructionsText}>
                  1. Visit the partner website or store{'\n'}
                  2. Add items to your cart{'\n'}
                  3. Enter this coupon code at checkout{'\n'}
                  4. Enjoy your discount!
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => {
                    const partnerUrl = purchasedItem.name.toLowerCase().includes('nike') ? 'https://nike.com' :
                                     purchasedItem.name.toLowerCase().includes('adidas') ? 'https://adidas.com' :
                                     purchasedItem.name.toLowerCase().includes('optimum') ? 'https://optimumnutrition.com' :
                                     'https://google.com/search?q=' + encodeURIComponent(purchasedItem.name);
                    
                    Linking.openURL(partnerUrl).catch(() => {
                      Alert.alert('Error', 'Could not open website');
                    });
                  }}
                >
                  <Ionicons name="open" size={16} color="#FFFFFF" />
                  <Text style={styles.shopButtonText}>Use Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowShopItemModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.saveNotice}>
                <Text style={styles.saveNoticeText}>
                  💡 Your coupon is automatically saved in your redemption history
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* My Codes Modal */}
      <Modal
        visible={showMyCodes}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMyCodes(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎫 My Discount Codes</Text>
            <TouchableOpacity onPress={() => setShowMyCodes(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {myCodes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎫</Text>
                <Text style={styles.emptyTitle}>No discount codes yet</Text>
                <Text style={styles.emptyText}>Redeem points for discount codes to see them here</Text>
              </View>
            ) : (
              <View style={styles.codesList}>
                {myCodes.map((code, index) => {
                  const isExpired = new Date(code.expiryDate) < new Date();
                  return (
                    <View key={index} style={[
                      styles.myCodeCard,
                      isExpired && styles.myCodeCardExpired
                    ]}>
                      <View style={styles.myCodeHeader}>
                        <Text style={styles.myCodeDiscount}>{code.discount}% OFF</Text>
                        <View style={styles.myCodeStatus}>
                          {isExpired && (
                            <View style={styles.statusBadge}>
                              <Text style={styles.statusBadgeText}>Expired</Text>
                            </View>
                          )}
                          {!isExpired && !code.used && (
                            <View style={[styles.statusBadge, { backgroundColor: theme.colors.success }]}>
                              <Text style={styles.statusBadgeText}>Active</Text>
                            </View>
                          )}
                          {code.used && (
                            <View style={[styles.statusBadge, { backgroundColor: theme.colors.textMuted }]}>
                              <Text style={styles.statusBadgeText}>Used</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.myCodeBox}>
                        <Text style={styles.myCodeText}>{code.code}</Text>
                      </View>

                      <View style={styles.myCodeDetails}>
                        <Text style={styles.myCodeDetailText}>
                          Generated: {new Date(code.generatedDate).toLocaleDateString()}
                        </Text>
                        <Text style={styles.myCodeDetailText}>
                          Expires: {new Date(code.expiryDate).toLocaleDateString()}
                        </Text>
                      </View>

                      {!isExpired && !code.used && (
                        <View style={styles.myCodeActions}>
                          <TouchableOpacity
                            style={styles.myCodeButton}
                            onPress={() => copyCodeToClipboard(code.code)}
                          >
                            <Ionicons name="copy" size={14} color="#FFFFFF" />
                            <Text style={styles.myCodeButtonText}>Copy</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.myCodeButton, { backgroundColor: theme.colors.success }]}
                            onPress={() => {
                              Linking.openURL('https://fitcoach.ai/shop').catch(() => {
                                Alert.alert('Error', 'Could not open website');
                              });
                            }}
                          >
                            <Ionicons name="open" size={14} color="#FFFFFF" />
                            <Text style={styles.myCodeButtonText}>Use Now</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Text style={styles.activeCodesText}>
              Active Codes: {myCodes.filter(code => !code.used && new Date(code.expiryDate) > new Date()).length}
            </Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  pointsCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pointsContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  points: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointsEmoji: {
    fontSize: 40,
  },
  streakCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.warning,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  streakSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  streakRight: {
    alignItems: 'flex-end',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.warning,
  },
  streakDays: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  streakAchievements: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  streakMilestone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakMilestoneActive: {
    backgroundColor: theme.colors.warning,
  },
  streakMilestoneText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  streakMilestoneTextActive: {
    color: '#FFFFFF',
  },
  streakMessage: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  streakMessageText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : '#EBF4FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(59, 130, 246, 0.2)' : '#BFDBFE',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.info,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  rewardCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rewardCardClaimed: {
    backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
    borderColor: theme.colors.success,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rewardStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardStatusClaimed: {
    backgroundColor: theme.colors.success,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  rewardTitleClaimed: {
    color: theme.colors.success,
  },
  rewardPoints: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  rewardDescription: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  rewardAction: {
    alignItems: 'flex-end',
  },
  actionButton: {
    backgroundColor: theme.colors.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  claimButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  claimedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '500',
  },
  discountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  discountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  discountEmoji: {
    fontSize: 20,
  },
  discountInfo: {
    flex: 1,
  },
  discountName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  discountDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  discountBadgeContainer: {
    alignSelf: 'flex-start',
  },
  discountBadge: {
    backgroundColor: theme.colors.success,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  discountAction: {
    alignItems: 'flex-end',
    gap: 8,
  },
  discountCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  discountButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  discountButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  discountButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  shopCategory: {
    marginBottom: 24,
  },
  shopCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  shopCategoryEmoji: {
    fontSize: 20,
  },
  shopCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  shopItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shopItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  shopItemEmoji: {
    fontSize: 20,
  },
  shopItemInfo: {
    flex: 1,
  },
  shopItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  shopItemDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  shopItemAction: {
    alignItems: 'flex-end',
    gap: 8,
  },
  shopItemCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  shopItemButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shopItemButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
  },
  shopItemButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  shopItemButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  historyEmoji: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  historyCost: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.error,
  },
  totalRedeemed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  codeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  codeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  codeSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  codeDisplay: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  codeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  codeDetails: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  codeInstructions: {
    width: '100%',
    backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : '#EBF4FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.info,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  shopButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: theme.colors.textMuted,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveNotice: {
    alignItems: 'center',
  },
  saveNoticeText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  codesList: {
    gap: 16,
  },
  myCodeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  myCodeCardExpired: {
    borderColor: theme.colors.border,
    opacity: 0.6,
  },
  myCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  myCodeDiscount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  myCodeStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  myCodeBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  myCodeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  myCodeDetails: {
    marginBottom: 12,
  },
  myCodeDetailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  myCodeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  myCodeButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  myCodeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  activeCodesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default Rewards;