import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Animated, { Easing } from 'react-native-reanimated';

const MyFarm = () => {
  // Static data
  const data = {
    totalFarmers: 150,
    totalOrders: 300,
    availableOrders: 120,
    completedOrders: 180,
    pendingOrders: 50,
    totalRevenue: 50000,
    totalCrops: 200,
  };

  // State for animated counters
  const [counters, setCounters] = useState({
    farmers: 0,
    orders: 0,
    available: 0,
    completed: 0,
    pending: 0,
    revenue: 0,
    crops: 0,
  });

  // Format number with commas
  const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Animation function with easing
  const animateCount = (target, key) => {
    const duration = 1500;
    const startTime = Date.now();
    
    const updateCounter = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easedProgress * target);
      
      setCounters(prev => ({
        ...prev,
        [key]: currentValue
      }));
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  useEffect(() => {
    animateCount(data.totalFarmers, 'farmers');
    animateCount(data.totalOrders, 'orders');
    animateCount(data.availableOrders, 'available');
    animateCount(data.completedOrders, 'completed');
    animateCount(data.pendingOrders, 'pending');
    animateCount(data.totalRevenue, 'revenue');
    animateCount(data.totalCrops, 'crops');
  }, []);

  // Data for the donut chart with green shades
  const chartData = [
    {
      name: 'Available Orders',
      population: data.availableOrders,
      color: '#2E7D32', // Dark green
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Completed Orders',
      population: data.completedOrders,
      color: '#4CAF50', // Medium green
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Pending Orders',
      population: data.pendingOrders,
      color: '#8BC34A', // Light green
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  // Card component for reusability
  const StatCard = ({ title, value, isCurrency = false }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Animated.Text style={styles.cardValue}>
        {isCurrency ? '₹' : ''}{formatNumber(value)}
      </Animated.Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>My Farm Dashboard</Text>

      <View style={styles.cardContainer}>
        <StatCard title="Total Farmers" value={counters.farmers} />
        <StatCard title="Total Orders" value={counters.orders} />
        <StatCard title="Available Orders" value={counters.available} />
        <StatCard title="Completed Orders" value={counters.completed} />
        <StatCard title="Pending Orders" value={counters.pending} />
        <StatCard title="Total Revenue" value={counters.revenue} isCurrency />
        <StatCard title="Total Crops" value={counters.crops} />
      </View>

      <Text style={styles.chartTitle}>Order Distribution</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={Math.min(Dimensions.get('window').width - 40, 400)}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          hasLegend={true}
          avoidFalseZero
          center={[10, 0]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9F5', // Light green background
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1B5E20', // Dark green text
    textAlign: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: Dimensions.get('window').width > 500 ? '30%' : '48%', // Responsive width
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#388E3C', // Green value color
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#1B5E20',
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default MyFarm;