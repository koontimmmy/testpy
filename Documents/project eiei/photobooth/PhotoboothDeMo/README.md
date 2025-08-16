# Photobooth Demo

เว็บแอปพลิเคชัน Photobooth อัตโนมัติที่รองรับการชำระเงินผ่าน Omise API

## คุณสมบัติ

- 💳 **ระบบชำระเงิน**: รองรับ Alipay, WeChat Pay, และ PromptPay ผ่าน Omise API
- 📸 **ถ่ายรูปอัตโนมัติ**: ถ่ายรูป 3 รูป พร้อมการนับถอยหลัง
- 🖼️ **เลือกรูป**: ให้ผู้ใช้เลือกรูปที่ต้องการปริ้น
- 🖨️ **ปริ้นรูป**: ระบบปริ้นรูปอัตโนมัติ
- 📱 **Responsive**: รองรับทุกอุปกรณ์

## การติดตั้ง

1. Clone โปรเจค:
```bash
git clone <repository-url>
cd PhotoboothDeMo
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. ตั้งค่า Omise API:
   - แก้ไขไฟล์ `config.js`
   - ใส่ Public Key และ Secret Key ของ Omise

4. เริ่มใช้งาน:
```bash
npm start
```

## การใช้งาน

1. **เลือกวิธีชำระเงิน**: เลือกระหว่าง Alipay, WeChat Pay, หรือ PromptPay
2. **ชำระเงิน**: สแกน QR Code เพื่อชำระเงิน
3. **ถ่ายรูป**: ระบบจะนับถอยหลังและถ่ายรูป 3 รูป
4. **เลือกรูป**: เลือกรูปที่ต้องการปริ้น 1 รูป
5. **ปริ้นรูป**: รอให้ระบบปริ้นรูปเสร็จสิ้น

## การตั้งค่า

### Omise API
1. สมัครบัญชี Omise ที่ https://omise.co
2. ได้รับ Public Key และ Secret Key
3. แก้ไขไฟล์ `config.js`:
```javascript
omise: {
    publicKey: 'pkey_test_xxxxxxxxxxxxxxx', // ใส่ Public Key
    secretKey: 'skey_test_xxxxxxxxxxxxxxx'  // ใส่ Secret Key
}
```

### Camera
- ตรวจสอบให้แน่ใจว่าอุปกรณ์มีกล้อง
- อนุญาตให้เบราว์เซอร์เข้าถึงกล้อง

### Printer
- ติดตั้งไดรเวอร์เครื่องปริ้น
- ตั้งค่าเครื่องปริ้นเป็น default printer

## โครงสร้างไฟล์

```
PhotoboothDeMo/
├── index.html          # หน้าเว็บหลัก
├── styles.css          # CSS สำหรับ UI
├── script.js           # JavaScript หลัก
├── config.js           # การตั้งค่า
├── package.json        # Node.js dependencies
└── README.md          # เอกสารนี้
```

## การพัฒนา

### เริ่มต้นการพัฒนา
```bash
npm run dev
```

### การแก้ไข
- แก้ไข UI ใน `styles.css`
- แก้ไข Logic ใน `script.js`
- แก้ไขการตั้งค่าใน `config.js`

## ข้อกำหนด

- เบราว์เซอร์ที่รองรับ ES6+
- HTTPS (สำหรับการเข้าถึงกล้อง)
- Node.js (สำหรับ development)

## License

MIT License