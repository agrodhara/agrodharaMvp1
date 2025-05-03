import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Animated from 'react-native-reanimated';

const MyFarm = () => {
  // Static data
  const totalFarmers = 150;
  const totalOrders = 300;
  const availableOrders = 120;
  const completedOrders = 180;
  const pendingOrders = 50;
  const totalRevenue = 50000; // Example revenue
  const totalCrops = 200; // Example crops

  // State for animated counters
  const [farmersCount, setFarmersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [revenueCount, setRevenueCount] = useState(0);
  const [cropsCount, setCropsCount] = useState(0);

  // Animation function
  const animateCount = (target, setCount) => {
    const duration = 2000; // 5 seconds
    const totalSteps = target; // Total steps to reach the target
    const intervalTime = duration / totalSteps; // Time per step

    let count = 0;
    const interval = setInterval(() => {
      if (count < target) {
        count++;
        setCount(count);
      } else {
        clearInterval(interval);
      }
    }, intervalTime);
  };

  useEffect(() => {
    animateCount(totalFarmers, setFarmersCount);
    animateCount(totalOrders, setOrdersCount);
    animateCount(availableOrders, setAvailableCount);
    animateCount(completedOrders, setCompletedCount);
    animateCount(pendingOrders, setPendingCount);
    animateCount(totalRevenue, setRevenueCount);
    animateCount(totalCrops, setCropsCount);
  }, []);

  // Data for the donut chart
  const chartData = [
    {
      name: 'Available Orders',
      population: availableOrders,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Completed Orders',
      population: completedOrders,
      color: '#FF9800',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Pending Orders',
      population: pendingOrders,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Farm Dashboard</Text>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Farmers</Text>
          <Animated.Text style={styles.cardValue}>{farmersCount}</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Orders Placed</Text>
          <Animated.Text style={styles.cardValue}>{ordersCount}</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Orders</Text>
          <Animated.Text style={styles.cardValue}>{availableCount}</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completed Orders</Text>
          <Animated.Text style={styles.cardValue}>{completedCount}</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending Orders</Text>
          <Animated.Text style={styles.cardValue}>{pendingCount}</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <Animated.Text style={styles.cardValue}>$50,000</Animated.Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Crops</Text>
          <Animated.Text style={styles.cardValue}>{cropsCount}</ Animated.Text>
        </View>
      </View>

      <Text style={styles.chartTitle}>Order Distribution</Text>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 40} // Responsive width
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    width: '48%', // Responsive width
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});

export default MyFarm;