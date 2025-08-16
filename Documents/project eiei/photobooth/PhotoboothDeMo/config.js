// Configuration file for Photobooth Demo
const CONFIG = {
    // Omise API Configuration
    omise: {
        publicKey: 'pkey_test_5xxxxxxxxxxxxxxxxxxx', // Replace with your Omise public key
        secretKey: 'skey_test_5xxxxxxxxxxxxxxxxxxx', // Replace with your Omise secret key (server-side only)
        apiUrl: 'https://api.omise.co'
    },
    
    // Payment Configuration
    payment: {
        amount: 10000, // Amount in satang (100 THB)
        currency: 'THB',
        description: 'Photobooth Service',
        supportedMethods: ['alipay', 'wechat_pay', 'promptpay']
    },
    
    // Camera Configuration
    camera: {
        width: 640,
        height: 480,
        facingMode: 'user',
        quality: 0.8
    },
    
    // Photo Session Configuration
    photoSession: {
        totalPhotos: 3,
        countdownTimes: [10, 4, 4], // seconds for each photo
        flashDuration: 200, // milliseconds
        pauseBetweenPhotos: 1000 // milliseconds
    },
    
    // Printer Configuration
    printer: {
        enabled: true,
        type: 'local', // 'local', 'network', or 'api'
        printSize: '4x6', // Photo size
        printQuality: 'high'
    },
    
    // UI Configuration
    ui: {
        theme: 'default',
        language: 'th',
        autoRestart: false,
        showPreview: true
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}