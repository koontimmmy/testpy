class PhotoboothApp {
    constructor() {
        this.apiBaseUrl = window.location.origin + '/api';
        this.currentPage = 'payment-page';
        this.capturedPhotos = [];
        this.currentPhotoIndex = 0;
        this.stream = null;
        this.paymentChargeId = null;
        this.paymentVerificationInterval = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkServerHealth();
    }

    async checkServerHealth() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`);
            const data = await response.json();
            console.log('Server health check:', data);
            
            // Hide demo banner if in production mode
            if (data.mode === 'PRODUCTION') {
                this.hideDemoBanner();
            } else {
                this.setupDemoBanner();
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            alert('เซิร์ฟเวอร์ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบการเชื่อมต่อ');
        }
    }

    setupDemoBanner() {
        const closeBanner = document.getElementById('close-demo-banner');
        if (closeBanner) {
            closeBanner.addEventListener('click', () => {
                this.hideDemoBanner();
            });
        }
    }

    hideDemoBanner() {
        const banner = document.getElementById('demo-banner');
        const app = document.getElementById('app');
        
        if (banner) {
            banner.classList.add('hidden');
        }
        if (app) {
            app.classList.add('no-demo-banner');
        }
    }

    setupEventListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.processPayment(method);
            });
        });

        // Photo selection
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const photoIndex = parseInt(e.currentTarget.parentElement.dataset.photo) - 1;
                this.selectPhoto(photoIndex);
            });
        });

        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        document.getElementById(pageId).classList.add('active');
        this.currentPage = pageId;
    }

    async processPayment(method) {
        this.showPage('payment-processing');
        
        try {
            // Create payment charge
            const chargeData = await this.createCharge(method);
            this.paymentChargeId = chargeData.id;
            
            // Show QR code if available
            if (chargeData.source && chargeData.source.scannable_code) {
                this.showQRCode(chargeData.source.scannable_code);
            }
            
            // Start payment verification
            this.startPaymentVerification();
            
        } catch (error) {
            console.error('Payment processing failed:', error);
            alert('เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง');
            this.showPage('payment-page');
        }
    }

    async createCharge(method) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/create-charge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: method,
                    amount: 10000, // 100 THB in satang
                    currency: 'THB'
                })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to create charge');
            }
            
            return data.charge;
        } catch (error) {
            console.error('Error creating charge:', error);
            throw error;
        }
    }

    showQRCode(qrCodeData) {
        const qrContainer = document.getElementById('payment-qr');
        if (qrCodeData && qrCodeData.image && qrCodeData.image.download_uri) {
            qrContainer.innerHTML = `<img src="${qrCodeData.image.download_uri}" alt="QR Code" style="max-width: 200px;">`;
        } else {
            qrContainer.innerHTML = '<p>QR Code ไม่สามารถแสดงได้</p>';
        }
    }

    startPaymentVerification() {
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds timeout
        
        this.paymentVerificationInterval = setInterval(async () => {
            attempts++;
            
            try {
                const response = await fetch(`${this.apiBaseUrl}/check-payment/${this.paymentChargeId}`);
                const data = await response.json();
                
                if (data.success && data.charge) {
                    if (data.charge.status === 'successful' || data.charge.paid) {
                        clearInterval(this.paymentVerificationInterval);
                        this.onPaymentSuccess();
                        return;
                    } else if (data.charge.status === 'failed') {
                        clearInterval(this.paymentVerificationInterval);
                        this.onPaymentFailed();
                        return;
                    }
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(this.paymentVerificationInterval);
                    this.onPaymentTimeout();
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                if (attempts >= maxAttempts) {
                    clearInterval(this.paymentVerificationInterval);
                    this.onPaymentTimeout();
                }
            }
        }, 1000);
    }

    onPaymentSuccess() {
        console.log('Payment successful!');
        this.startPhotoSession();
    }

    onPaymentFailed() {
        alert('การชำระเงินล้มเหลว กรุณาลองใหม่อีกครั้ง');
        this.showPage('payment-page');
    }

    onPaymentTimeout() {
        alert('การชำระเงินหมดเวลา กรุณาลองใหม่อีกครั้ง');
        this.showPage('payment-page');
    }

    async startPhotoSession() {
        this.showPage('camera-page');
        this.currentPhotoIndex = 0;
        this.capturedPhotos = [];
        
        try {
            await this.initializeCamera();
            await this.takePhotos();
        } catch (error) {
            console.error('Camera error:', error);
            alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
        }
    }

    async initializeCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            const video = document.getElementById('camera-video');
            video.srcObject = this.stream;
            
            return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('Cannot access camera');
        }
    }

    async takePhotos() {
        const delays = [10, 4, 4]; // First photo: 10s, second and third: 4s each
        
        for (let i = 0; i < 3; i++) {
            this.currentPhotoIndex = i;
            document.getElementById('photo-number').textContent = i + 1;
            
            await this.countdown(delays[i]);
            await this.capturePhoto();
            
            if (i < 2) {
                await this.delay(1000); // 1 second pause between photos
            }
        }
        
        this.stopCamera();
        this.showPhotoSelection();
    }

    async countdown(seconds) {
        const countdownElement = document.getElementById('countdown');
        
        for (let i = seconds; i > 0; i--) {
            countdownElement.textContent = i;
            await this.delay(1000);
        }
        
        countdownElement.textContent = 'SMILE!';
        await this.delay(500);
    }

    async capturePhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.capturedPhotos.push(photoDataUrl);
        
        // Flash effect
        document.body.style.backgroundColor = 'white';
        await this.delay(200);
        document.body.style.backgroundColor = '';
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    showPhotoSelection() {
        this.showPage('photo-selection');
        
        // Display captured photos
        for (let i = 0; i < this.capturedPhotos.length; i++) {
            const img = document.getElementById(`photo-${i + 1}`);
            img.src = this.capturedPhotos[i];
        }
    }

    selectPhoto(photoIndex) {
        const selectedPhoto = this.capturedPhotos[photoIndex];
        this.printPhoto(selectedPhoto);
    }

    printPhoto(photoData) {
        this.showPage('printing-page');
        
        // Simulate printing process
        setTimeout(() => {
            this.onPrintingComplete();
        }, 3000);
        
        // In a real implementation, you would send the photo to a printer
        // This could be done via:
        // 1. A local printing service/API
        // 2. A network printer
        // 3. A USB-connected printer
        console.log('Printing photo:', photoData);
    }

    onPrintingComplete() {
        this.showPage('success-page');
    }

    restart() {
        this.capturedPhotos = [];
        this.currentPhotoIndex = 0;
        this.paymentChargeId = null;
        
        // Clear payment verification interval
        if (this.paymentVerificationInterval) {
            clearInterval(this.paymentVerificationInterval);
            this.paymentVerificationInterval = null;
        }
        
        this.stopCamera();
        this.showPage('payment-page');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.photoboothApp = new PhotoboothApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause camera if running
        if (window.photoboothApp && window.photoboothApp.stream) {
            window.photoboothApp.stopCamera();
        }
    }
});

// Handle beforeunload to cleanup camera
window.addEventListener('beforeunload', () => {
    if (window.photoboothApp && window.photoboothApp.stream) {
        window.photoboothApp.stopCamera();
    }
});