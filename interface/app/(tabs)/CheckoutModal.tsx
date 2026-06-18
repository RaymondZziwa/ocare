// CheckoutModal.tsx (React Native)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { X, Smartphone, CreditCard as CreditCardIcon, Check, AlertCircle } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';


interface CheckoutModalProps {
    visible: boolean;
    cart: ICartItem[];
    total: number;
    onClose: () => void;
    onCompleteSale: () => void;
}

const PAYMENT_METHODS = [
    { id: 'MTN_MOMO', label: 'MTN Mobile Money', icon: Smartphone, color: '#FFB300' },
    { id: 'AIRTEL_MOMO', label: 'Airtel Mobile Money', icon: Smartphone, color: '#E60000' },
];

const CheckoutModal: React.FC<CheckoutModalProps> = ({
                                                         visible,
                                                         cart,
                                                         total,
                                                         onClose,
                                                         onCompleteSale,
                                                     }) => {
    const user = useSelector((state: RootState) => state.userAuth.data);

    const [selectedMethod, setSelectedMethod] = useState<string>('MTN_MOMO');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingReference, setPendingReference] = useState<string | null>(null);

    // Format phone number to always start with +256
    const formatPhoneNumber = (number: string): string => {
        if (!number) return '';
        const cleanNumber = number.replace(/\D/g, '');

        if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
            return '+256' + cleanNumber.substring(1);
        }

        if (cleanNumber.startsWith('256') && cleanNumber.length === 12) {
            return '+' + cleanNumber;
        }

        if (number.startsWith('+256')) {
            return number;
        }

        if (cleanNumber.length === 9) {
            return '+256' + cleanNumber;
        }

        return number;
    };

    // Validate phone number
    const isValidPhoneNumber = (number: string): boolean => {
        const formatted = formatPhoneNumber(number);
        return formatted.startsWith('+256') && formatted.length === 13;
    };

    // Handle payment completion after successful webhook
    const handlePaymentComplete = () => {
        setShowPaymentModal(false);
        setPendingReference(null);
        onCompleteSale();

        // Reset form
        setSelectedMethod('MTN_MOMO');
        setPhoneNumber('');
        setIsSubmitting(false);
    };

    // Handle payment failure
    const handlePaymentFailed = () => {
        setShowPaymentModal(false);
        setPendingReference(null);
        setIsSubmitting(false);
        Alert.alert('Payment Failed', 'Payment failed. Please try again or use another payment method.');
    };

    const handlePay = async () => {
        // Validation
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter a phone number');
            return;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            Alert.alert('Error', 'Please enter a valid phone number (e.g., 07xxxxxxxx or +256xxxxxxxxx)');
            return;
        }

        if (cart.length === 0) {
            Alert.alert('Error', 'Cart is empty');
            return;
        }

        setIsSubmitting(true);

        const storedStore = localStorage.getItem('posStore');
        const storeId = storedStore ? JSON.parse(storedStore).storeId : null;

        // Calculate mobile money charges (8%)
        const chargePercentage = 0.08;
        const charges = total * chargePercentage;
        const totalWithCharges = total + charges;

        const checkoutData = {
            customerId: undefined, // Walk-in customer
            status: 'FULLY_PAID' as const,
            paymentMethods: [
                {
                    type: selectedMethod,
                    amount: total,
                },
            ],
            notes: '',
            total,
            balance: 0,
            items: cart.map(item => ({
                id: item.id,
                categoryId: item.category?.id,
                name: item.name || '',
                price: (item.sellingPrice || 0).toString(),
                barcode: (item.barcode || '').toString(),
                category: {
                    id: item.category?.id,
                    name: item.category?.name || '',
                },
                quantity: item.quantity || 0,
                discount: item.discount || 0,
                total: item.total || 0,
                unitId: item.unitId || 0,
            })),
            storeId: storeId,
            servedBy: user?.id ? user.id : 0,
            totalWithCharges,
            phoneNumber: formatPhoneNumber(phoneNumber),
        };

        try {
            const res = await apiRequest(SALESENDPOINTS.POS.complete_sale, 'POST', '', checkoutData);

            console.log('Complete sale response:', res);

            // Check for reference in response
            const reference = res?.data?.transaction?.reference ||
                res?.data?.reference ||
                res?.transaction?.reference ||
                res?.reference;

            if (reference) {
                localStorage.setItem('PendingReference', reference);
                setPendingReference(reference);
                setShowPaymentModal(true);
            } else {
                Alert.alert('Error', 'Failed to initiate mobile money payment. Please try again.');
                setIsSubmitting(false);
            }
        } catch (error: any) {
            console.error('Complete sale error:', error);
            Alert.alert('Error', error?.response?.data?.message || 'An error occurred while processing the payment.');
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    const SelectedIcon = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.icon || Smartphone;
    const selectedColor = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.color || '#FFB300';

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Mobile Money Payment</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isSubmitting}>
                                <X size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.content}>
                            {/* Order Summary */}
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                <Text style={styles.totalAmount}>UGX {total.toLocaleString()}</Text>
                                <View style={styles.chargesRow}>
                                    <Text style={styles.chargesText}>Mobile Money Fee (8%):</Text>
                                    <Text style={styles.chargesAmount}>UGX {(total * 0.08).toLocaleString()}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalText}>Total to Pay:</Text>
                                    <Text style={styles.totalAmount}>UGX {(total * 1.08).toLocaleString()}</Text>
                                </View>
                            </View>

                            {/* Payment Method Selection */}
                            <Text style={styles.sectionTitle}>Select Payment Method</Text>
                            <View style={styles.methodContainer}>
                                {PAYMENT_METHODS.map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = selectedMethod === method.id;
                                    return (
                                        <TouchableOpacity
                                            key={method.id}
                                            style={[
                                                styles.methodButton,
                                                isSelected && { borderColor: method.color, backgroundColor: `${method.color}10` },
                                            ]}
                                            onPress={() => setSelectedMethod(method.id)}
                                        >
                                            <Icon size={28} color={isSelected ? method.color : '#999'} />
                                            <Text style={[styles.methodLabel, isSelected && { color: method.color, fontWeight: '600' }]}>
                                                {method.label}
                                            </Text>
                                            {isSelected && <View style={[styles.selectedDot, { backgroundColor: method.color }]} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Phone Number Input */}
                            <Text style={styles.sectionTitle}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Text style={styles.countryCode}>+256</Text>
                                <TextInput
                                    style={styles.phoneInput}
                                    placeholder="7xxxxxxxx"
                                    placeholderTextColor="#999"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    editable={!isSubmitting}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Enter phone number starting with 0 (e.g., 07xxxxxxxx) or without country code
                            </Text>

                            {/* Pay Button */}
                            <TouchableOpacity
                                style={[styles.payButton, isSubmitting && styles.payButtonDisabled]}
                                onPress={handlePay}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Check size={20} color="#fff" />
                                        <Text style={styles.payButtonText}>Pay with {selectedMethod === 'MTN_MOMO' ? 'MTN' : 'Airtel'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Cancel Button */}
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSubmitting}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Payment Waiting Modal */}
            <PaymentWaitingModal
                visible={showPaymentModal}
                reference={pendingReference}
                onClose={() => {
                    setShowPaymentModal(false);
                    setPendingReference(null);
                    setIsSubmitting(false);
                }}
                onPaymentComplete={handlePaymentComplete}
                onPaymentFailed={handlePaymentFailed}
            />
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    chargesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    chargesText: {
        fontSize: 12,
        color: '#e67e22',
    },
    chargesAmount: {
        fontSize: 12,
        color: '#e67e22',
        fontWeight: '500',
    },
    totalText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    methodContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    methodButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e5e5',
        backgroundColor: '#fff',
        position: 'relative',
    },
    methodLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
    },
    selectedDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e5e5',
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    countryCode: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        backgroundColor: '#f5f5f5',
    },
    phoneInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
        color: '#333',
    },
    helperText: {
        fontSize: 12,
        color: '#999',
        marginTop: 8,
        marginBottom: 24,
    },
    payButton: {
        flexDirection: 'row',
        backgroundColor: '#27ae60',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    payButtonDisabled: {
        backgroundColor: '#a5d6a7',
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    cancelButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        color: '#999',
    },
});

export default CheckoutModal;