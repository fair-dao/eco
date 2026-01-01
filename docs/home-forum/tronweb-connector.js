// TronWeb Wallet Connector
class TronWebConnector {
    constructor() {
        this.tronWeb = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.init();
    }

    async init() {
        try {
            // Check if TronLink is installed
            if (window.tronWeb && window.tronWeb.ready) {
                this.tronWeb = window.tronWeb;
                await this.connect();
            } else {
                // Wait for TronLink to be available
                const interval = setInterval(async () => {
                    if (window.tronWeb && window.tronWeb.ready) {
                        this.tronWeb = window.tronWeb;
                        await this.connect();
                        clearInterval(interval);
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Failed to initialize TronWeb:', error);
        }
    }

    async connect() {
        try {
            if (!this.tronWeb) {
                throw new Error('TronWeb not available');
            }

            // Request account access
            const accounts = await this.tronWeb.request({ method: 'tron_requestAccounts' });
            this.walletAddress = accounts[0];
            this.isConnected = true;

            // Emit connect event
            this.emit('connect', this.walletAddress);
            return this.walletAddress;
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            this.emit('error', error.message);
            return null;
        }
    }

    async disconnect() {
        try {
            // TronLink doesn't have a disconnect method, so we just reset our state
            this.isConnected = false;
            this.walletAddress = null;
            this.emit('disconnect');
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            this.emit('error', error.message);
        }
    }

    async signMessage(message) {
        try {
            if (!this.isConnected || !this.tronWeb) {
                throw new Error('Wallet not connected');
            }

            const signature = await this.tronWeb.trx.signMessageV2(message, this.walletAddress);
            return signature;
        } catch (error) {
            console.error('Failed to sign message:', error);
            this.emit('error', error.message);
            return null;
        }
    }

    // Event emitter implementation
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    getTronWeb() {
        return this.tronWeb;
    }

    getWalletAddress() {
        return this.walletAddress;
    }

    isWalletConnected() {
        return this.isConnected;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TronWebConnector;
} else {
    window.TronWebConnector = TronWebConnector;
}