// PaymentWaitingModal.tsx (React Native)
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
    ActivityIndicator,
} from 'react-native';
import { CheckCircle, XCircle, Smartphone, Clock, AlertTriangle } from 'lucide-react-native';

interface PaymentWaitingModalProps {
    visible: boolean;
    reference: string | null;
    onClose: () => void;
    onPaymentComplete: () => void;
    onPaymentFailed: () => void;
}

const PaymentWaitingModal: React.FC<PaymentWaitingModalProps> = ({
                                                                     visible,
                                                                     reference,
                                                                     onClose,
                                                                     onPaymentComplete,
                                                                     onPaymentFailed,
                                                                 }) => {
    const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'timeout'>('pending');
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [pollCount, setPollCount] = useState(0);
    const isPollingActive = useRef(true);
    const spinValue = useRef(new Animated.Value(0)).current;

    // Start spinning animation
    useEffect(() => {
        if (status === 'pending') {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }
    }, [status]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    // Stop all polling and timeouts
    const stopPolling = () => {
        isPollingActive.current = false;

        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
            successTimeoutRef.current = null;
        }
    };

    // Poll payment status
    const pollPaymentStatus = async (paymentRef: string) => {
        if (!isPollingActive.current) return;

        try {
            const endpoint = SALESENDPOINTS.POS.PING_PAYMENT_STATUS(paymentRef);
            const response = await apiRequest(endpoint, 'GET', '');

            console.log('Payment status response:', response);

            setPollCount(prev => prev + 1);

            if (response?.data?.status === 'COMPLETED') {
                console.log('Payment completed! Stopping polling...');
                stopPolling();
                setStatus('completed');

                successTimeoutRef.current = setTimeout(() => {
                    onPaymentComplete();
                }, 5000);
                return;
            }

            if (response?.data?.status === 'FAILED') {
                console.log('Payment failed! Stopping polling...');
                stopPolling();
                setStatus('failed');

                setTimeout(() => {
                    if (isPollingActive.current !== false) {
                        onPaymentFailed();
                    }
                }, 3000);
                return;
            }

            if (response?.data?.status === 'PENDING') {
                console.log(`Payment still pending (poll #${pollCount + 1})`);
            }

        } catch (error) {
            console.error('Error polling payment status:', error);
        }
    };

    // Start polling and timeout
    const startPolling = (paymentRef: string) => {
        isPollingActive.current = true;

        const interval = setInterval(() => {
            if (paymentRef && isPollingActive.current) {
                pollPaymentStatus(paymentRef);
            }
        }, 3000);

        pollingIntervalRef.current = interval;

        const timeout = setTimeout(() => {
            if (status === 'pending' && isPollingActive.current) {
                console.log('Payment timeout! Stopping polling...');
                stopPolling();
                setStatus('timeout');

                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        }, 300000);

        timeoutIdRef.current = timeout;
    };

    // Timer for elapsed time
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (status === 'pending') {
            timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [status]);

    // Start polling when modal becomes visible
    useEffect(() => {
        if (visible && reference) {
            console.log('Starting polling for reference:', reference);
            setStatus('pending');
            setElapsedTime(0);
            setPollCount(0);
            startPolling(reference);
        }

        return () => {
            stopPolling();
        };
    }, [visible, reference]);

    // Get status message based on elapsed time
    const getStatusMessage = () => {
        if (elapsedTime < 15) {
            return "Please check your phone and enter your PIN to complete the payment.";
        } else if (elapsedTime < 30) {
            return "Still waiting for PIN confirmation. Please check your phone.";
        } else if (elapsedTime < 60) {
            return "Taking longer than expected. Make sure you've entered your PIN.";
        } else {
            return "Still processing. This may take a few more moments...";
        }
    };

    // Progress percentage (max 300 seconds = 5 minutes)
    const progressPercent = Math.min((elapsedTime / 300) * 100, 100);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>

                    {/* Pending State */}
                    {status === 'pending' && (
                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                    <View style={styles.spinnerOuter}>
                                        <View style={styles.spinnerInner}>
                                            <Smartphone size={40} color="#14b8a6" />
                                        </View>
                                    </View>
                                </Animated.View>
                            </View>

                            <Text style={styles.title}>Processing Payment</Text>

                            <Text style={styles.message}>{getStatusMessage()}</Text>

                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Reference:</Text>
                                    <Text style={styles.infoValue}>
                                        {reference?.slice(0, 8)}...{reference?.slice(-8)}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Waiting time:</Text>
                                    <Text style={[styles.infoValue, styles.timeValue]}>{formatTime(elapsedTime)}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Attempts:</Text>
                                    <Text style={styles.infoValue}>{pollCount} checking...</Text>
                                </View>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                                </View>
                                <Text style={styles.progressText}>
                                    Timeout in {formatTime(Math.max(0, 300 - elapsedTime))}
                                </Text>
                            </View>

                            <View style={styles.waitingIndicator}>
                                <ActivityIndicator size="small" color="#14b8a6" />
                                <Text style={styles.waitingText}>Waiting for payment confirmation...</Text>
                            </View>

                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel Payment</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Completed State */}
                    {status === 'completed' && (
                        <View style={styles.content}>
                            <View style={[styles.iconCircle, styles.successCircle]}>
                                <CheckCircle size={50} color="#10b981" />
                            </View>

                            <Text style={[styles.title, styles.successTitle]}>Payment Successful!</Text>

                            <Text style={styles.message}>Your payment has been confirmed. Redirecting in 5 seconds...</Text>

                            <View style={[styles.infoCard, styles.successCard]}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Transaction ID:</Text>
                                    <Text style={[styles.infoValue, styles.successText]}>
                                        {reference?.slice(0, 12)}...
                                    </Text>
                                </View>
                                <View style={styles.progressBarLight}>
                                    <View style={[styles.progressFillSuccess, { width: '100%' }]} />
                                </View>
                                <Text style={styles.closingText}>Closing in 5 seconds...</Text>
                            </View>
                        </View>
                    )}

                    {/* Failed State */}
                    {status === 'failed' && (
                        <View style={styles.content}>
                            <View style={[styles.iconCircle, styles.failedCircle]}>
                                <XCircle size={50} color="#ef4444" />
                            </View>

                            <Text style={[styles.title, styles.failedTitle]}>Payment Failed</Text>

                            <Text style={styles.message}>The payment could not be processed. Please try again.</Text>

                            <View style={[styles.infoCard, styles.failedCard]}>
                                <View style={styles.warningRow}>
                                    <AlertTriangle size={16} color="#ef4444" />
                                    <Text style={styles.warningText}>
                                        Possible reasons: Insufficient funds, wrong PIN, network timeout, or transaction cancelled by user.
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.closeButtonRed} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Timeout State */}
                    {status === 'timeout' && (
                        <View style={styles.content}>
                            <View style={[styles.iconCircle, styles.timeoutCircle]}>
                                <Clock size={50} color="#f97316" />
                            </View>

                            <Text style={[styles.title, styles.timeoutTitle]}>Payment Timeout</Text>

                            <Text style={styles.message}>
                                The payment took too long to complete. The transaction has expired.
                            </Text>

                            <View style={[styles.infoCard, styles.timeoutCard]}>
                                <Text style={styles.timeoutCardText}>
                                    Please try again or use a different payment method.
                                </Text>
                            </View>

                            <TouchableOpacity style={styles.closeButtonOrange} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        width: '90%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#e5e5e5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#14b8a610',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successCircle: {
        backgroundColor: '#10b98120',
    },
    failedCircle: {
        backgroundColor: '#ef444420',
    },
    timeoutCircle: {
        backgroundColor: '#f9731620',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    successTitle: {
        color: '#10b981',
    },
    failedTitle: {
        color: '#ef4444',
    },
    timeoutTitle: {
        color: '#f97316',
    },
    message: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    infoCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        width: '100%',
        marginBottom: 20,
    },
    successCard: {
        backgroundColor: '#10b98110',
    },
    failedCard: {
        backgroundColor: '#ef444410',
    },
    timeoutCard: {
        backgroundColor: '#f9731610',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
    },
    infoValue: {
        fontSize: 12,
        fontWeight: '500',
        color: '#14b8a6',
    },
    timeValue: {
        fontFamily: 'monospace',
    },
    progressContainer: {
        width: '100%',
        marginBottom: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e5e5e5',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#14b8a6',
    },
    progressBarLight: {
        height: 4,
        backgroundColor: '#10b98130',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 12,
    },
    progressFillSuccess: {
        height: '100%',
        backgroundColor: '#10b981',
    },
    progressText: {
        fontSize: 11,
        color: '#999',
        marginTop: 6,
        textAlign: 'center',
    },
    waitingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    waitingText: {
        fontSize: 12,
        color: '#999',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    closeButtonRed: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#ef4444',
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    closeButtonOrange: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#f97316',
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    warningRow: {
        flexDirection: 'row',
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#ef4444',
    },
    successText: {
        color: '#10b981',
    },
    closingText: {
        fontSize: 11,
        color: '#10b981',
        textAlign: 'center',
        marginTop: 8,
    },
    timeoutCardText: {
        fontSize: 13,
        color: '#f97316',
        textAlign: 'center',
    },
});

export default PaymentWaitingModal;