// data/stocks.js
const stocksData = {
    "THYAO": {
      symbol: "THYAO",
      name: "Türk Hava Yolları A.O.",
      sector: "Ulaştırma",
      description: "Türkiye'nin bayrak taşıyıcı havayolu şirketi. KAP bildirimleri aşağıda listelenmiştir.",
      price: "₺250,00",
      change: "+₺2,10",
      changePercent: "+0,85%",
      isPositive: true,
      lastUpdate: "06.04.2025 - BIST kapanış (Tahmini)",
      news: [
        {
          date: "7 Nisan 2025",
          isToday: true,
          items: [
            {
              time: "09:15",
              title: "THY Yeni Pilot Alım Programını Başlattı",
              category: "İnsan Kaynakları",
              content: "<p>Türk Hava Yolları (THY), artan filo ve operasyon ihtiyaçları doğrultusunda yeni bir pilot alım programı başlattığını duyurdu.</p><p>Programa başvuracak adaylarda aranan kriterler ve başvuru süreci KAP'ta yayınlanan bildirimde detaylandırılmıştır. Bu alım programı şirketin büyüme hedeflerini desteklemektedir.</p><p>Detaylı bilgi için KAP bildirimine başvurulabilir.</p>",
              active: true
            }
          ]
        },
        {
          date: "6 Nisan 2025",
          isToday: false,
          items: [
            {
              time: "17:50",
              title: "THY Mart Ayı Trafik Verileri Açıklandı",
              category: "Operasyonel Veri",
              content: "<p>Türk Hava Yolları, Mart ayı trafik verilerini KAP'ta açıkladı.</p><p>Detaylı bilgi için KAP bildirimine başvurulabilir.</p>",
              active: false
            },
            {
              time: "11:20",
              title: "THY Teknik A.Ş. Yeni Bakım Anlaşması İmzaladı",
              category: "İş Anlaşması",
              content: "<p>THY Teknik A.Ş. yeni bir bakım anlaşması imzaladığını duyurdu.</p><p>Detaylı bilgi için KAP bildirimine başvurulabilir.</p>",
              active: false
            }
          ]
        }
      ]
    },
    
    "GARAN": {
      symbol: "GARAN",
      name: "Türkiye Garanti Bankası A.Ş.",
      sector: "Bankacılık",
      description: "Türkiye'nin önde gelen bankalarından biri.",
      price: "₺52,80",
      change: "-₺0,70",
      changePercent: "-1,30%",
      isPositive: false,
      lastUpdate: "06.04.2025 - BIST kapanış (Tahmini)",
      news: []
    },
    
    "ASELS": {
      symbol: "ASELS",
      name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.",
      sector: "Savunma",
      description: "Türkiye'nin önde gelen savunma sanayi şirketi.",
      price: "₺98,40",
      change: "+₺1,20",
      changePercent: "+1,24%",
      isPositive: true,
      lastUpdate: "06.04.2025 - BIST kapanış (Tahmini)",
      news: []
    },
    
    "EREGL": {
      symbol: "EREGL",
      name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
      sector: "Demir-Çelik",
      description: "Türkiye'nin en büyük yassı çelik üreticisi.",
      price: "₺35,60",
      change: "+₺0,22",
      changePercent: "+0,62%",
      isPositive: true,
      lastUpdate: "06.04.2025 - BIST kapanış (Tahmini)",
      news: []
    },
    
    "SISE": {
      symbol: "SISE",
      name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.",
      sector: "Holding",
      description: "Cam, kimyasallar, ve diğer alanlarda faaliyet gösteren holding şirketi.",
      price: "₺27,90",
      change: "-₺0,16",
      changePercent: "-0,57%",
      isPositive: false,
      lastUpdate: "06.04.2025 - BIST kapanış (Tahmini)",
      news: []
    }
  };