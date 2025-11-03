import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const Shop = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('featured');
  const [showCheckout, setShowCheckout] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [discountPoints, setDiscountPoints] = useState(0);

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    try {
      const storedCart = JSON.parse(await AsyncStorage.getItem('shopCart') || '[]');
      const storedPoints = await AsyncStorage.getItem('userPoints') || '0';
      const storedPurchases = JSON.parse(await AsyncStorage.getItem('purchasedItems') || '[]');
      setCart(storedCart);
      setUserPoints(parseInt(storedPoints));
      setPurchasedItems(storedPurchases);
    } catch (error) {
      console.error('Error loading shop data:', error);
    }
  };

  // Product categories
  const productCategories = [
    { id: 'all', name: 'All Products', icon: 'storefront' },
    { id: 'supplements', name: 'Supplements', icon: 'medical' },
    { id: 'equipment', name: 'Equipment', icon: 'barbell' },
    { id: 'apparel', name: 'Apparel', icon: 'shirt' },
    { id: 'nutrition', name: 'Nutrition', icon: 'restaurant' },
    { id: 'premium', name: 'Premium', icon: 'star' }
  ];

  // Products data
  const products = [
    // Supplements
    {
      id: 1,
      name: 'Optimum Nutrition Gold Standard Whey',
      category: 'supplements',
      price: 3799,
      originalPrice: 4999,
      image: '💊',
      rating: 4.8,
      reviews: 1250,
      description: 'Premium whey protein isolate for muscle building',
      brand: 'Optimum Nutrition',
      inStock: true,
      discount: 25,
      currency: '₹'
    },
    {
      id: 2,
      name: 'Creatine Monohydrate 300g',
      category: 'supplements',
      price: 1599,
      originalPrice: 2099,
      image: '⚡',
      rating: 4.7,
      reviews: 890,
      description: 'Pure creatine for strength and power',
      brand: 'MuscleTech',
      inStock: true,
      discount: 24,
      currency: '₹'
    },
    {
      id: 3,
      name: 'Pre-Workout Energy Boost',
      category: 'supplements',
      price: 2749,
      originalPrice: 3299,
      image: '🔥',
      rating: 4.6,
      reviews: 650,
      description: 'High-energy pre-workout formula',
      brand: 'Cellucor',
      inStock: true,
      discount: 18,
      currency: '₹'
    },
    // Equipment
    {
      id: 4,
      name: 'Adjustable Dumbbells Set',
      category: 'equipment',
      price: 24999,
      originalPrice: 32999,
      image: '🏋️',
      rating: 4.9,
      reviews: 420,
      description: 'Space-saving adjustable dumbbells 5-50lbs',
      brand: 'Bowflex',
      inStock: true,
      discount: 25,
      currency: '₹'
    },
    {
      id: 5,
      name: 'Resistance Bands Kit',
      category: 'equipment',
      price: 2099,
      originalPrice: 2899,
      image: '🔗',
      rating: 4.5,
      reviews: 780,
      description: 'Complete resistance training system',
      brand: 'TRX',
      inStock: true,
      discount: 29,
      currency: '₹'
    },
    {
      id: 6,
      name: 'Premium Yoga Mat',
      category: 'equipment',
      price: 4199,
      originalPrice: 5799,
      image: '🧘',
      rating: 4.7,
      reviews: 920,
      description: 'Eco-friendly non-slip yoga mat',
      brand: 'Manduka',
      inStock: true,
      discount: 29,
      currency: '₹'
    },
    // Apparel
    {
      id: 7,
      name: 'Nike Dri-FIT Training Shirt',
      category: 'apparel',
      price: 2099,
      originalPrice: 2499,
      image: '👕',
      rating: 4.6,
      reviews: 1100,
      description: 'Moisture-wicking performance shirt',
      brand: 'Nike',
      inStock: true,
      discount: 17,
      currency: '₹'
    },
    {
      id: 8,
      name: 'Adidas Training Shorts',
      category: 'apparel',
      price: 1699,
      originalPrice: 2099,
      image: '🩳',
      rating: 4.5,
      reviews: 850,
      description: 'Comfortable workout shorts',
      brand: 'Adidas',
      inStock: true,
      discount: 20,
      currency: '₹'
    },
    // Nutrition
    {
      id: 9,
      name: 'Premium Protein Bar',
      category: 'nutrition',
      price: 199,
      originalPrice: 249,
      image: '🍫',
      rating: 4.6,
      reviews: 850,
      description: 'High-protein energy bar with natural ingredients',
      brand: 'FitCoach',
      inStock: true,
      discount: 20,
      currency: '₹'
    },
    {
      id: 10,
      name: 'Organic Protein Bars (12 pack)',
      category: 'nutrition',
      price: 2399,
      originalPrice: 2899,
      image: '📦',
      rating: 4.4,
      reviews: 720,
      description: 'Clean protein bars with natural ingredients',
      brand: 'Quest',
      inStock: true,
      discount: 17,
      currency: '₹'
    },
    {
      id: 11,
      name: 'Multivitamin Complex',
      category: 'nutrition',
      price: 3299,
      originalPrice: 4199,
      image: '💊',
      rating: 4.6,
      reviews: 540,
      description: 'Complete daily vitamin supplement',
      brand: 'Garden of Life',
      inStock: true,
      discount: 20,
      currency: '₹'
    },
    // Premium
    {
      id: 12,
      name: 'FitCoach AI Premium (3 Months)',
      category: 'premium',
      price: 2499,
      originalPrice: 3299,
      image: '⭐',
      rating: 4.9,
      reviews: 2100,
      description: 'Premium AI coaching with advanced features',
      brand: 'FitCoach AI',
      inStock: true,
      discount: 25,
      currency: '₹'
    },
    {
      id: 13,
      name: 'Personal Training Session (1 Hour)',
      category: 'premium',
      price: 6599,
      originalPrice: 8299,
      image: '🎯',
      rating: 4.8,
      reviews: 340,
      description: 'One-on-one virtual training session',
      brand: 'FitCoach AI',
      inStock: true,
      discount: 20,
      currency: '₹'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        return b.discount - a.discount;
      default:
        return 0;
    }
  });

  const addToCart = async (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    await AsyncStorage.setItem('shopCart', JSON.stringify(newCart));
    Alert.alert('Added to Cart', `${product.name} added to cart!`);
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    await AsyncStorage.setItem('shopCart', JSON.stringify(newCart));
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    setCart(newCart);
    await AsyncStorage.setItem('shopCart', JSON.stringify(newCart));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Discount system: 10 points = 1 rupee
  const calculateDiscount = (points) => {
    return Math.floor(points / 10);
  };

  const getMaxDiscountForProduct = (productPrice) => {
    const maxDiscount = calculateDiscount(userPoints);
    return Math.min(maxDiscount, productPrice);
  };

  const applyDiscount = (originalPrice, discountAmount) => {
    return Math.max(0, originalPrice - discountAmount);
  };

  const proceedToCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handlePayment = async (paymentMethod) => {
    const totalPrice = getTotalPrice();

    Alert.alert(
      'Confirm Payment',
      `Confirm payment of ₹${totalPrice.toLocaleString('en-IN')} via ${paymentMethod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            const orderId = 'FC' + Date.now().toString().slice(-6);

            const order = {
              id: orderId,
              items: [...cart],
              total: totalPrice,
              paymentMethod: paymentMethod,
              date: new Date().toISOString(),
              status: 'confirmed'
            };

            const existingOrders = JSON.parse(await AsyncStorage.getItem('fitcoachOrders') || '[]');
            const newOrders = [order, ...existingOrders];
            await AsyncStorage.setItem('fitcoachOrders', JSON.stringify(newOrders));

            setCart([]);
            setShowCheckout(false);
            await AsyncStorage.setItem('shopCart', JSON.stringify([]));

            Alert.alert(
              '🎉 Order Confirmed!',
              `Order ID: ${orderId}\nTotal: ₹${totalPrice.toLocaleString('en-IN')}\n\nYour fitness products will be delivered within 3-5 business days.\n\nThank you for shopping with FitCoach!`
            );
          }
        }
      ]
    );
  };

  const buyNow = (product) => {
    Alert.alert(
      'Buy Now',
      `Buy ${product.name} for ₹${product.price.toLocaleString('en-IN')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now', onPress: async () => {
            const newCart = [{ ...product, quantity: 1 }];
            setCart(newCart);
            await AsyncStorage.setItem('shopCart', JSON.stringify(newCart));
            setShowCheckout(true);
          }
        }
      ]
    );
  };



  const styles = createStyles(theme);

  const ProductCard = ({ product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        style={styles.productImageContainer}
        onPress={() => {
          setSelectedProduct(product);
          setShowProductModal(true);
          setDiscountPoints(0);
        }}
      >
        <Text style={styles.productImage}>{product.image}</Text>
        {product.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <TouchableOpacity onPress={() => {
          setSelectedProduct(product);
          setShowProductModal(true);
        }}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        </TouchableOpacity>
        <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            <Text style={styles.starText}>{'★'.repeat(Math.floor(product.rating))}</Text>
          </View>
          <Text style={styles.reviewText}>({product.reviews})</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.buyButton, !product.inStock && styles.disabledButton]}
            onPress={() => buyNow(product)}
            disabled={!product.inStock}
          >
            <Text style={styles.buyButtonText}>
              {product.inStock ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                setSelectedProduct(product);
                setShowProductModal(true);
                setDiscountPoints(0);
              }}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cartButton, !product.inStock && styles.disabledButton]}
              onPress={() => addToCart(product)}
              disabled={!product.inStock}
            >
              <Text style={styles.cartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FitCoach Shop</Text>
        <TouchableOpacity onPress={() => setShowCart(true)} style={styles.cartIcon}>
          <Ionicons name="bag" size={24} color={theme.colors.text} />
          {getTotalItems() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerSubtitle}>FitCoach Shop</Text>
            <Text style={styles.bannerTitle}>Premium Fitness Products</Text>
          </View>
          <Ionicons name="storefront" size={32} color="#FFFFFF" />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sort Dropdown */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortOptions}>
              {[
                { value: 'featured', label: 'Featured' },
                { value: 'price-low', label: 'Price: Low to High' },
                { value: 'price-high', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'discount', label: 'Best Deals' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
          {productCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryTab, selectedCategory === category.id && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={20}
                color={selectedCategory === category.id ? '#FFFFFF' : theme.colors.text}
              />
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.categoryTabTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Count */}
        <Text style={styles.productsCount}>
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </Text>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </View>

        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or category filter</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => setShowCart(true)}
        >
          <Ionicons name="bag" size={24} color="#FFFFFF" />
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>{getTotalItems()}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Shopping Cart Modal */}
      <Modal
        visible={showCart}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCart(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shopping Cart</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="bag-outline" size={64} color={theme.colors.textMuted} />
                <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                <Text style={styles.emptyCartText}>Add some fitness products to get started!</Text>
              </View>
            ) : (
              <View style={styles.cartItems}>
                {cart.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <Text style={styles.cartItemImage}>{item.image}</Text>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(item.id)}
                    >
                      <Ionicons name="trash" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>₹{getTotalPrice().toLocaleString('en-IN')}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutButton} onPress={proceedToCheckout}>
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Checkout Modal */}
      <Modal
        visible={showCheckout}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCheckout(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Secure Checkout</Text>
            <TouchableOpacity onPress={() => setShowCheckout(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              {cart.map((item) => (
                <View key={item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemText}>{item.name} × {item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
                </View>
              ))}
              <View style={styles.orderTotal}>
                <Text style={styles.orderTotalText}>Total:</Text>
                <Text style={styles.orderTotalPrice}>₹{getTotalPrice().toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Payment Methods */}
            <View style={styles.paymentMethods}>
              <Text style={styles.sectionTitle}>Choose Payment Method</Text>

              {[
                { method: 'Credit Card', icon: 'card', description: 'Visa, Mastercard, American Express' },
                { method: 'Razorpay', icon: 'card', description: 'UPI, Cards, Net Banking, Wallets' },
                { method: 'UPI', icon: 'phone-portrait', description: 'PhonePe, Google Pay, Paytm, BHIM' },
                { method: 'Net Banking', icon: 'business', description: 'All major Indian banks supported' }
              ].map((payment) => (
                <TouchableOpacity
                  key={payment.method}
                  style={styles.paymentOption}
                  onPress={() => handlePayment(payment.method)}
                >
                  <Ionicons name={payment.icon} size={24} color={theme.colors.text} />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentMethod}>{payment.method}</Text>
                    <Text style={styles.paymentDescription}>{payment.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark" size={16} color={theme.colors.info} />
              <Text style={styles.securityText}>
                Your payment information is secure and encrypted. We partner with trusted payment processors.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Product Details Modal */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
          setDiscountPoints(0);
        }}
      >
        {selectedProduct && (
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Product Details</Text>
              <TouchableOpacity onPress={() => {
                setShowProductModal(false);
                setSelectedProduct(null);
                setDiscountPoints(0);
              }}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.productDetails}>
                <Text style={styles.productDetailImage}>{selectedProduct.image}</Text>
                <Text style={styles.productDetailName}>{selectedProduct.name}</Text>
                <Text style={styles.productDetailBrand}>{selectedProduct.brand}</Text>
                <Text style={styles.productDetailDescription}>{selectedProduct.description}</Text>

                <View style={styles.productDetailRating}>
                  <Text style={styles.starText}>{'★'.repeat(Math.floor(selectedProduct.rating))}</Text>
                  <Text style={styles.reviewText}>({selectedProduct.reviews} reviews)</Text>
                </View>

                {/* Price Section */}
                <View style={styles.priceSection}>
                  <View style={styles.originalPriceRow}>
                    <Text style={styles.priceSectionLabel}>Original Price:</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productDetailPrice}>₹{selectedProduct.price.toLocaleString('en-IN')}</Text>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <Text style={styles.productDetailOriginalPrice}>₹{selectedProduct.originalPrice.toLocaleString('en-IN')}</Text>
                      )}
                    </View>
                  </View>

                  {/* Discount Section */}
                  <View style={styles.discountSection}>
                    <View style={styles.pointsRow}>
                      <Text style={styles.priceSectionLabel}>Your Points:</Text>
                      <Text style={styles.pointsValue}>{userPoints.toLocaleString()} points</Text>
                    </View>
                    <View style={styles.pointsRow}>
                      <Text style={styles.priceSectionLabel}>Max Discount:</Text>
                      <Text style={styles.maxDiscountValue}>₹{getMaxDiscountForProduct(selectedProduct.price)} (10 pts = ₹1)</Text>
                    </View>

                    {/* Discount Slider */}
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderLabel}>Use Points for Discount: ₹{calculateDiscount(discountPoints)}</Text>
                      {/* Note: React Native doesn't have a built-in slider, so we'll use buttons for now */}
                      <View style={styles.discountControls}>
                        <TouchableOpacity
                          style={styles.discountButton}
                          onPress={() => setDiscountPoints(Math.max(0, discountPoints - 100))}
                        >
                          <Text style={styles.discountButtonText}>-100</Text>
                        </TouchableOpacity>
                        <Text style={styles.discountPointsText}>{discountPoints} points</Text>
                        <TouchableOpacity
                          style={styles.discountButton}
                          onPress={() => setDiscountPoints(Math.min(userPoints, selectedProduct.price * 10, discountPoints + 100))}
                        >
                          <Text style={styles.discountButtonText}>+100</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Final Price */}
                    <View style={styles.finalPriceContainer}>
                      <View style={styles.finalPriceRow}>
                        <Text style={styles.finalPriceLabel}>Final Price:</Text>
                        <View style={styles.finalPriceValue}>
                          <Text style={styles.finalPrice}>₹{applyDiscount(selectedProduct.price, calculateDiscount(discountPoints)).toLocaleString('en-IN')}</Text>
                          {discountPoints > 0 && (
                            <Text style={styles.savingsText}>You save ₹{calculateDiscount(discountPoints)} with {discountPoints} points!</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.productDetailActions}>
                  <TouchableOpacity
                    style={[styles.addToCartDetailButton, !selectedProduct.inStock && styles.disabledButton]}
                    onPress={() => {
                      const discountedProduct = {
                        ...selectedProduct,
                        originalPrice: selectedProduct.price,
                        price: applyDiscount(selectedProduct.price, calculateDiscount(discountPoints)),
                        discountApplied: calculateDiscount(discountPoints),
                        pointsUsed: discountPoints
                      };
                      addToCart(discountedProduct);
                      if (discountPoints > 0) {
                        const newPoints = userPoints - discountPoints;
                        setUserPoints(newPoints);
                        AsyncStorage.setItem('userPoints', newPoints.toString());
                      }
                      setShowProductModal(false);
                      setSelectedProduct(null);
                      setDiscountPoints(0);
                    }}
                    disabled={!selectedProduct.inStock}
                  >
                    <Text style={styles.addToCartDetailButtonText}>
                      {selectedProduct.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.buyNowDetailButton, !selectedProduct.inStock && styles.disabledButton]}
                    onPress={() => {
                      const discountedProduct = {
                        ...selectedProduct,
                        originalPrice: selectedProduct.price,
                        price: applyDiscount(selectedProduct.price, calculateDiscount(discountPoints)),
                        discountApplied: calculateDiscount(discountPoints),
                        pointsUsed: discountPoints
                      };
                      const newCart = [{ ...discountedProduct, quantity: 1 }];
                      setCart(newCart);
                      AsyncStorage.setItem('shopCart', JSON.stringify(newCart));
                      if (discountPoints > 0) {
                        const newPoints = userPoints - discountPoints;
                        setUserPoints(newPoints);
                        AsyncStorage.setItem('userPoints', newPoints.toString());
                      }
                      setShowProductModal(false);
                      setSelectedProduct(null);
                      setDiscountPoints(0);
                      setShowCheckout(true);
                    }}
                    disabled={!selectedProduct.inStock}
                  >
                    <Text style={styles.buyNowDetailButtonText}>
                      {selectedProduct.inStock ? 'Buy Now' : 'Out of Stock'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
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
    paddingVertical: 12,
    paddingTop: 60,
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
  cartIcon: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeBanner: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sortOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryTabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  productsCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  productImageContainer: {
    position: 'relative',
    padding: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  productImage: {
    fontSize: 32,
    marginBottom: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  starText: {
    color: '#FFA500',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  originalPrice: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  buttonContainer: {
    gap: 8,
  },
  buyButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailsButtonText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  cartButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    opacity: 0.6,
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
  floatingCartButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: theme.colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  cartItems: {
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  cartItemImage: {
    fontSize: 24,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  checkoutButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderSummary: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderItemText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  orderTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  orderTotalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : '#EBF4FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  productDetails: {
    alignItems: 'center',
  },
  productDetailImage: {
    fontSize: 64,
    marginBottom: 16,
  },
  productDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  productDetailBrand: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  productDetailDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  productDetailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  priceSection: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  originalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceSectionLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productDetailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  productDetailOriginalPrice: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  maxDiscountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.warning,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  discountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  discountButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  discountPointsText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  finalPriceContainer: {
    backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : '#EBF4FF',
    borderRadius: 8,
    padding: 12,
  },
  finalPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalPriceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  finalPriceValue: {
    alignItems: 'flex-end',
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  savingsText: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 2,
  },
  productDetailActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  addToCartDetailButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartDetailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowDetailButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyNowDetailButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Shop;