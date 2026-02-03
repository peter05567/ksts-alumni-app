import CustomHeader from '@/components/CustomHeader'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// Dummy Data for Transactions
const TRANSACTIONS_DATA = [
  { id: '1', title: 'Monthly Dues - Jan', date: 'Jan 28, 2024', amount: '-$50.00', type: 'debit', status: 'Paid' },
  { id: '2', title: 'Project Contribution', date: 'Jan 15, 2024', amount: '-$100.00', type: 'debit', status: 'Paid' },
  { id: '3', title: 'Scholarship Fund', date: 'Dec 20, 2023', amount: '-$25.00', type: 'debit', status: 'Paid' },
  { id: '4', title: 'Refund Adjustment', date: 'Dec 10, 2023', amount: '+$15.00', type: 'credit', status: 'Received' },
  { id: '5', title: 'Annual Dinner', date: 'Nov 30, 2023', amount: '-$80.00', type: 'debit', status: 'Paid' },
]

const TransactionItem = ({ item }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <View style={[styles.iconContainer, { backgroundColor: item.type === 'credit' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 82, 82, 0.2)' }]}>
        <Ionicons 
          name={item.type === 'credit' ? "arrow-down-outline" : "arrow-up-outline"} 
          size={20} 
          color={item.type === 'credit' ? "#4CAF50" : "#FF5252"} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
    </View>
    <View style={styles.transactionRight}>
      <Text style={[styles.transactionAmount, { color: item.type === 'credit' ? "#4CAF50" : "#fff" }]}>
        {item.amount}
      </Text>
      <Text style={[styles.transactionStatus, { color: item.status === 'Paid' ? '#FFD700' : '#888' }]}>{item.status}</Text>
    </View>
  </View>
)

export default function FinanceScreen() {
  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Finance & Dues" 
        onLeftPress={() => console.log('Menu')} 
        onRightPress1={() => console.log('Add')} 
        onRightPress2={() => console.log('Profile')} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Total Group Funds Card - Highlighted */}
        <View style={styles.highlightCard}>
          <LinearGradient
            colors={['#FFD700', '#FFA000']} // Gold gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabelDark}>Total Group Funds</Text>
              <Ionicons name="wallet-outline" size={24} color="#000" />
            </View>
            <Text style={styles.bigAmountDark}>$125,430.00</Text>
            <Text style={styles.cardSubtextDark}>+12% from last month</Text>
          </LinearGradient>
        </View>

        {/* Personal Finance Summary Grid */}
        <View style={styles.summaryGrid}>
          {/* My Total Contribution */}
          <View style={styles.summaryCard}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={20} color="#FFD700" />
            </View>
            <Text style={styles.summaryLabel}>My Contribution</Text>
            <Text style={styles.summaryAmount}>$1,250.00</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '70%' }]} />
            </View>
            <Text style={styles.progressText}>Top 30% of contributors</Text>
          </View>

          {/* Outstanding Dues */}
          <View style={styles.summaryCard}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 82, 82, 0.2)' }]}>
              <Ionicons name="alert-circle" size={20} color="#FF5252" />
            </View>
            <Text style={styles.summaryLabel}>Outstanding Dues</Text>
            <Text style={[styles.summaryAmount, { color: '#FF5252' }]}>$50.00</Text>
            <Text style={styles.dueDateText}>Due: Feb 01, 2024</Text>
            <TouchableOpacity style={styles.payNowButton}>
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            {TRANSACTIONS_DATA.map(item => (
              <TransactionItem key={item.id} item={item} />
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  highlightCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientBackground: {
    padding: 20,
    height: 160,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabelDark: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
  bigAmountDark: {
    color: '#000',
    fontSize: 36,
    fontWeight: 'bold',
  },
  cardSubtextDark: {
    color: '#000',
    fontSize: 14,
    opacity: 0.7,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: 'rgba(20, 20, 20, 1)',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
  },
  dueDateText: {
    color: '#FF5252',
    fontSize: 11,
    marginBottom: 12,
  },
  payNowButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  payNowText: {
    color: '#FF5252',
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionsSection: {
    backgroundColor: 'rgba(20, 20, 20, 1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#FFD700',
    fontSize: 14,
  },
  transactionsList: {
    gap: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    justifyContent: 'center',
  },
  transactionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 11,
  },
})
