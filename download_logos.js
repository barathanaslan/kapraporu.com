// download_logos.js
// Bu script, fintables_analyst_ratings.json dosyasındaki tüm aracı kurum logolarını
// indirir ve /data/analist_tavsiye_logo/ klasörüne kaydeder.

const fs = require('fs');
const path = require('path');
const https = require('https'); // Logo URL'leri https olduğu için

// --- Dosya ve Klasör Yolları ---
const DATA_DIR = path.join(__dirname, 'data');
const JSON_FILE_PATH = path.join(DATA_DIR, 'analyst_ratings.json');
const LOGO_OUTPUT_DIR = path.join(DATA_DIR, 'analist_tavsiye_logo');

// --- Ana Fonksiyon ---
function downloadAllLogos() {
    // 1. Logo klasörünün var olup olmadığını kontrol et, yoksa oluştur
    if (!fs.existsSync(LOGO_OUTPUT_DIR)) {
        fs.mkdirSync(LOGO_OUTPUT_DIR, { recursive: true });
        console.log(`✅ Klasör oluşturuldu: ${LOGO_OUTPUT_DIR}`);
    }

    // 2. JSON dosyasını oku
    if (!fs.existsSync(JSON_FILE_PATH)) {
        console.error(`❌ HATA: JSON dosyası bulunamadı: ${JSON_FILE_PATH}`);
        return;
    }
    const jsonData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
    const ratingsData = JSON.parse(jsonData);

    // 3. Tekrarlananları engellemek için tüm aracı kurumları bir Map'te topla
    const uniqueBrokerages = new Map();
    ratingsData.results.forEach(rating => {
        if (rating.brokerage && rating.brokerage.code && !uniqueBrokerages.has(rating.brokerage.code)) {
            uniqueBrokerages.set(rating.brokerage.code, rating.brokerage);
        }
    });

    console.log(`ℹ️ ${uniqueBrokerages.size} adet benzersiz aracı kurum bulundu. İndirme başlıyor...`);

    // 4. Her bir benzersiz kurum için logoyu indir
    uniqueBrokerages.forEach(brokerage => {
        const logoUrl = brokerage.logo;
        const code = brokerage.code;
        
        if (!logoUrl) {
            console.warn(`⚠️ UYARI: ${brokerage.title} (${code}) için logo URL'si bulunamadı.`);
            return;
        }

        // Dosya uzantısını URL'den al (örn: .png)
        const extension = path.extname(new URL(logoUrl).pathname) || '.png';
        const fileName = `${code}${extension}`;
        const filePath = path.join(LOGO_OUTPUT_DIR, fileName);

        const fileStream = fs.createWriteStream(filePath);
        
        https.get(logoUrl, (response) => {
            if (response.statusCode !== 200) {
                console.error(`❌ HATA: ${logoUrl} indirilemedi. (Status: ${response.statusCode})`);
                return;
            }
            response.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`✅ İndirildi ve kaydedildi: ${fileName}`);
            });
        }).on('error', (err) => {
            console.error(`❌ HATA: ${logoUrl} indirilirken hata oluştu: ${err.message}`);
            fs.unlink(filePath, () => {}); // Hata durumunda boş dosyayı sil
        });
    });
}

// --- Script'i Başlat ---
downloadAllLogos();