const express = require('express');
const cors = require('cors');
const path = require('path');
const omise = require('omise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Check if we have real API keys or use demo mode
const hasRealKeys = process.env.OMISE_SECRET_KEY && 
                   process.env.OMISE_SECRET_KEY !== 'skey_test_your_secret_key_here' &&
                   process.env.OMISE_SECRET_KEY !== 'skey_test_example_key' &&
                   process.env.OMISE_SECRET_KEY !== 'demo_mode' &&
                   process.env.OMISE_SECRET_KEY.startsWith('skey_');

const DEMO_MODE = !hasRealKeys;

// Initialize Omise with secret key (only if we have real keys)
let omiseClient = null;
if (!DEMO_MODE) {
    omiseClient = omise({
        secretKey: process.env.OMISE_SECRET_KEY,
        omiseVersion: '2019-05-29'
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create payment charge
app.post('/api/create-charge', async (req, res) => {
    try {
        const { method, amount = process.env.PAYMENT_AMOUNT || 10000, currency = process.env.PAYMENT_CURRENCY || 'THB' } = req.body;
        
        if (DEMO_MODE) {
            console.log('Creating DEMO charge for method:', method);
            
            // Demo mode - simulate payment creation
            const demoCharge = {
                id: 'chrg_demo_' + Date.now(),
                amount: parseInt(amount),
                currency: currency,
                status: 'pending',
                source: {
                    type: method,
                    flow: 'redirect',
                    scannable_code: {
                        type: 'qr_code',
                        image: {
                            download_uri: generateDemoQRCode(method)
                        }
                    }
                }
            };
            
            console.log('Demo charge created:', demoCharge.id);
            
            res.json({
                success: true,
                charge: demoCharge
            });
        } else {
            console.log('Creating REAL charge for method:', method);
            
            let sourceData = {};
            
            // Configure source based on payment method
            switch (method) {
                case 'alipay':
                    sourceData = {
                        type: 'alipay',
                        amount: parseInt(amount),
                        currency: currency
                    };
                    break;
                case 'wechat_pay':
                    sourceData = {
                        type: 'wechat_pay',
                        amount: parseInt(amount),
                        currency: currency
                    };
                    break;
                case 'promptpay':
                    sourceData = {
                        type: 'promptpay',
                        amount: parseInt(amount),
                        currency: currency
                    };
                    break;
                default:
                    return res.status(400).json({ error: 'Unsupported payment method' });
            }
            
            // Create source
            const source = await omiseClient.sources.create(sourceData);
            console.log('Source created:', source.id);
            
            // Create charge
            const charge = await omiseClient.charges.create({
                amount: parseInt(amount),
                currency: currency,
                source: source.id,
                description: process.env.PAYMENT_DESCRIPTION || 'Photobooth Service'
            });
            
            console.log('Charge created:', charge.id);
            
            res.json({
                success: true,
                charge: {
                    id: charge.id,
                    amount: charge.amount,
                    currency: charge.currency,
                    status: charge.status,
                    source: {
                        type: source.type,
                        flow: source.flow,
                        scannable_code: source.scannable_code
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error creating charge:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Generate demo QR code
function generateDemoQRCode(method) {
    // Simple QR code placeholder - in real app, this would be actual QR code
    const qrData = {
        'alipay': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwOWNkZSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUxJUEFZPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REVNTYBITL9EPC90ZXh0Pgo8L3N2Zz4=',
        'wechat_pay': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzA5YjEwYyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+V2VDaGF0PC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REVNTYBITL9EPC90ZXh0Pgo8L3N2Zz4=',
        'promptpay': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzI5NDY5OSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvbXB0UGF5PC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+REVNTYBITL9EPC90ZXh0Pgo8L3N2Zz4='
    };
    
    return qrData[method] || qrData['promptpay'];
}

// Check payment status
app.get('/api/check-payment/:chargeId', async (req, res) => {
    try {
        const { chargeId } = req.params;
        
        if (DEMO_MODE) {
            console.log('Checking DEMO payment status for:', chargeId);
            
            // Demo mode - simulate payment success after 5-10 seconds
            const chargeCreatedTime = parseInt(chargeId.split('_')[2]);
            const currentTime = Date.now();
            const timeDiff = currentTime - chargeCreatedTime;
            
            let status = 'pending';
            let paid = false;
            
            // Auto-succeed after 8 seconds for demo
            if (timeDiff > 8000) {
                status = 'successful';
                paid = true;
            }
            
            res.json({
                success: true,
                charge: {
                    id: chargeId,
                    status: status,
                    paid: paid,
                    amount: 10000,
                    currency: 'THB'
                }
            });
        } else {
            console.log('Checking REAL payment status for:', chargeId);
            
            const charge = await omiseClient.charges.retrieve(chargeId);
            
            res.json({
                success: true,
                charge: {
                    id: charge.id,
                    status: charge.status,
                    paid: charge.paid,
                    amount: charge.amount,
                    currency: charge.currency
                }
            });
        }
        
    } catch (error) {
        console.error('Error checking payment:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Webhook endpoint for Omise (DEMO MODE)
app.post('/api/webhook', (req, res) => {
    const event = req.body;
    
    console.log('Received DEMO webhook:', event.key || 'demo-event');
    
    // Demo mode - just acknowledge
    res.status(200).json({ received: true, demo: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        mode: DEMO_MODE ? 'DEMO' : 'PRODUCTION',
        message: DEMO_MODE ? 'Demo mode - no real payment processing' : 'Production mode - real payment processing',
        hasSecretKey: !DEMO_MODE
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Photobooth server running on port ${PORT}`);
    console.log(`🌐 Visit http://localhost:${PORT} to use the application`);
    
    if (DEMO_MODE) {
        console.log(`📱 DEMO MODE: Payment will auto-succeed after 8 seconds`);
        console.log(`🔧 To use real Omise API, add your secret key to .env file`);
    } else {
        console.log(`💳 PRODUCTION MODE: Using real Omise API`);
        console.log(`🔑 Public Key: ${process.env.OMISE_PUBLIC_KEY}`);
    }
});

module.exports = app;