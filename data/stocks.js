// data/stocks.js
// This file contains ONLY static company information.
// Dynamic information (prices, changes, etc.) should be loaded from a separate data source.
// For the home page news feed, implement a solution that loads news from individual JSON files.

const stocksData = {
  "THYAO": {
    symbol: "THYAO",
    name: "Türk Hava Yolları A.O.",
    sector: "Ulaştırma",
    description: "Türkiye'nin bayrak taşıyıcı havayolu şirketi. 1933 yılında kurulan şirket, 120'den fazla ülkede 300'den fazla noktaya uçuş gerçekleştirmektedir. Star Alliance üyesi olan THY, dünyanın en fazla ülkesine uçan havayolu şirketi unvanına sahiptir.",
    website: "https://www.turkishairlines.com/",
    founded: "1933",
    headquarters: "İstanbul, Türkiye",
    // Dynamic data fields below should NOT be maintained here
    // They're included as placeholders until the dynamic loading system is implemented
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "GARAN": {
    symbol: "GARAN",
    name: "Türkiye Garanti Bankası A.Ş.",
    sector: "Bankacılık",
    description: "Türkiye'nin önde gelen özel bankalarından biri olan Garanti BBVA, 1946 yılında kurulmuştur. Banka, kurumsal, ticari, KOBİ, bireysel ve özel bankacılık hizmetleri sunmaktadır. İspanyol bankacılık grubu BBVA, bankanın en büyük hissedarıdır.",
    website: "https://www.garantibbva.com.tr/",
    founded: "1946",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "ASELS": {
    symbol: "ASELS",
    name: "Aselsan Elektronik Sanayi ve Ticaret A.Ş.",
    sector: "Savunma Sanayi",
    description: "Türkiye'nin lider savunma elektroniği şirketi olan ASELSAN, 1975 yılında kurulmuştur. Askeri ve sivil haberleşme sistemleri, radar sistemleri, elektronik harp sistemleri, elektro-optik sistemler ve savunma teknolojileri alanlarında faaliyet göstermektedir. Türk Silahlı Kuvvetlerini Güçlendirme Vakfı şirketin ana hissedarıdır.",
    website: "https://www.aselsan.com.tr/",
    founded: "1975",
    headquarters: "Ankara, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "EREGL": {
    symbol: "EREGL",
    name: "Ereğli Demir ve Çelik Fabrikaları T.A.Ş.",
    sector: "Demir-Çelik",
    description: "Türkiye'nin en büyük entegre yassı çelik üreticisi olan Erdemir, 1960 yılında kurulmuştur. Şirket, otomotiv, beyaz eşya, gemi inşa, boru, makine imalat ve enerji sektörleri için yassı çelik ürünleri üretmektedir. OYAK Grup, şirketin ana hissedarıdır.",
    website: "https://www.erdemir.com.tr/",
    founded: "1960",
    headquarters: "Zonguldak, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "SISE": {
    symbol: "SISE",
    name: "Türkiye Şişe ve Cam Fabrikaları A.Ş.",
    sector: "Sanayi / Cam",
    description: "Şişecam, 1935 yılında kurulan Türkiye'nin önde gelen cam ve kimyasallar üreticisidir. Düzcam, cam ev eşyası, cam ambalaj ve kimyasallar alanlarında faaliyet gösteren şirket, Avrupa'nın en büyük cam üreticilerinden biridir. Şirket, 14 ülkede 43 tesiste üretim yapmaktadır.",
    website: "https://www.sisecam.com.tr/",
    founded: "1935",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "CIMSA": {
    symbol: "CIMSA",
    name: "Çimsa Çimento Sanayi ve Ticaret A.Ş.",
    sector: "Çimento",
    description: "1972 yılında kurulan Çimsa, Türkiye'nin önde gelen çimento ve yapı malzemeleri üreticilerinden biridir. Gri çimento, beyaz çimento ve özel ürünler üretimi yapan şirket, Sabancı Holding bünyesinde faaliyet göstermektedir. Şirket, 5 kıtada 65'ten fazla ülkeye ihracat yapmaktadır.",
    website: "https://www.cimsa.com.tr/",
    founded: "1972",
    headquarters: "Mersin, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "AEFES": {
    symbol: "AEFES",
    name: "Anadolu Efes Biracılık ve Malt Sanayii A.Ş.",
    sector: "İçecek",
    description: "1969 yılında kurulan Anadolu Efes, Türkiye'nin en büyük içecek şirketidir. Bira ve meşrubat sektörlerinde faaliyet gösteren şirket, Coca-Cola İçecek'in de ana ortağıdır. 6 ülkede 21 bira fabrikası, 5 malt üretim tesisi ve 26 şişeleme tesisiyle Avrupa'nın 5. büyük bira üreticisi konumundadır.",
    website: "https://www.anadoluefes.com/",
    founded: "1969",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "TUPRS": {
    symbol: "TUPRS",
    name: "TÜPRAŞ Türkiye Petrol Rafinerileri A.Ş.",
    sector: "Enerji / Rafineri",
    description: "Türkiye'nin en büyük sanayi kuruluşu olan TÜPRAŞ, 1983 yılında kurulmuştur. Şirket, İzmit, İzmir, Kırıkkale ve Batman'da bulunan dört rafineriyle petrol ürünleri üretimi ve dağıtımı yapmaktadır. Koç Holding bünyesinde faaliyet gösteren şirket, Türkiye'nin tek rafineri şirketidir.",
    website: "https://www.tupras.com.tr/",
    founded: "1983",
    headquarters: "Kocaeli, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "TCELL": {
    symbol: "TCELL",
    name: "Turkcell İletişim Hizmetleri A.Ş.",
    sector: "Telekomünikasyon",
    description: "1994 yılında kurulan Turkcell, Türkiye'nin ilk GSM operatörü ve lider telekomünikasyon şirketidir. Mobil ve sabit iletişim hizmetlerinin yanı sıra dijital servisler ve teknoloji çözümleri sunan şirket, New York Borsası'na kote olan ilk Türk şirketidir. Türkiye dışında Ukrayna, Belarus ve KKTC'de de faaliyet göstermektedir.",
    website: "https://www.turkcell.com.tr/",
    founded: "1994",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "AKBNK": {
    symbol: "AKBNK",
    name: "Akbank T.A.Ş.",
    sector: "Bankacılık",
    description: "1948 yılında kurulan Akbank, Türkiye'nin en büyük özel bankalarından biridir. Kurumsal, ticari, KOBİ, bireysel, özel bankacılık ve uluslararası bankacılık alanlarında hizmet veren banka, Sabancı Holding bünyesinde faaliyet göstermektedir. 700'den fazla şubesi ve dijital bankacılık kanallarıyla milyonlarca müşteriye hizmet vermektedir.",
    website: "https://www.akbank.com/",
    founded: "1948",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "BIMAS": {
    symbol: "BIMAS",
    name: "BİM Birleşik Mağazalar A.Ş.",
    sector: "Perakende",
    description: "1995 yılında kurulan BİM, Türkiye'nin lider indirim perakende zinciridir. 'Her Gün Düşük Fiyat' politikasıyla faaliyet gösteren şirket, Türkiye genelinde 8.000'den fazla mağazası ile gıda ve tüketim ürünleri satışı yapmaktadır. Şirket ayrıca Fas ve Mısır'da da faaliyet göstermektedir.",
    website: "https://www.bim.com.tr/",
    founded: "1995",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "FROTO": {
    symbol: "FROTO",
    name: "Ford Otomotiv Sanayi A.Ş.",
    sector: "Otomotiv",
    description: "1959 yılında kurulan Ford Otosan, Türkiye'nin en büyük otomotiv üreticilerinden biridir. Koç Holding ve Ford Motor Company ortaklığıyla faaliyet gösteren şirket, ticari araçlar ve binek otomobiller üretmektedir. Kocaeli, Eskişehir ve Ankara'daki tesislerinde Transit, Custom, Courier gibi modelleri üreten şirket, Türkiye'nin ihracat liderleri arasındadır.",
    website: "https://www.fordotosan.com.tr/",
    founded: "1959",
    headquarters: "Kocaeli, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "PGSUS": {
    symbol: "PGSUS",
    name: "Pegasus Hava Taşımacılığı A.Ş.",
    sector: "Ulaştırma",
    description: "1990 yılında kurulan Pegasus Havayolları, Türkiye'nin önde gelen düşük maliyetli havayolu şirketidir. 2005 yılında Esas Holding tarafından satın alınan şirket, yurt içi ve yurt dışında 100'den fazla noktaya uçuş gerçekleştirmektedir. 'Herkesin uçma hakkı var' sloganıyla ekonomik fiyat politikası izlemektedir.",
    website: "https://www.flypgs.com/",
    founded: "1990",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "KOZAL": {
    symbol: "KOZAL",
    name: "Koza Altın İşletmeleri A.Ş.",
    sector: "Madencilik",
    description: "Koza Altın, Türkiye'nin en büyük altın üreticisi olup, altın madenciliği sektöründe faaliyet göstermektedir. Şirket, Türkiye'nin çeşitli bölgelerinde altın madeni işletmeleri ve arama projeleri yürütmektedir. Şirket, 2005 yılında halka açılmıştır ve Türkiye'nin önemli maden şirketlerinden biridir.",
    website: "http://www.kozaaltin.com.tr/",
    founded: "1980'ler",
    headquarters: "Ankara, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "TAVHL": {
    symbol: "TAVHL",
    name: "TAV Havalimanları Holding A.Ş.",
    sector: "Havacılık / Hizmet",
    description: "1997 yılında kurulan TAV Havalimanları, havalimanı işletmeciliği alanında faaliyet gösteren global bir şirkettir. Groupe ADP'nin iştiraki olan şirket, Türkiye, Tunus, Gürcistan, Makedonya, Suudi Arabistan ve Hırvatistan'da havalimanları işletmektedir. Havalimanı işletmeciliğinin yanı sıra duty free, yiyecek-içecek, yer hizmetleri gibi alanlarda da hizmet vermektedir.",
    website: "https://www.tavhavalimanlari.com.tr/",
    founded: "1997",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "TOASO": {
    symbol: "TOASO",
    name: "Tofaş Türk Otomobil Fabrikası A.Ş.",
    sector: "Otomotiv",
    description: "1968 yılında kurulan Tofaş, Türkiye'nin önde gelen otomobil üreticilerinden biridir. Koç Holding ve Fiat Chrysler Automobiles (FCA) ortaklığıyla faaliyet gösteren şirket, Bursa'daki tesisinde Fiat markalı binek ve ticari araçlar üretmektedir. Şirket, Türkiye'nin otomotiv ihracatında önemli paya sahiptir.",
    website: "https://www.tofas.com.tr/",
    founded: "1968",
    headquarters: "Bursa, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "ISCTR": {
    symbol: "ISCTR",
    name: "Türkiye İş Bankası A.Ş.",
    sector: "Bankacılık",
    description: "1924 yılında Mustafa Kemal Atatürk'ün girişimiyle kurulan Türkiye İş Bankası, Türkiye'nin ilk ulusal bankasıdır. Kurumsal, ticari, KOBİ, bireysel ve özel bankacılık alanlarında geniş bir ürün ve hizmet yelpazesi sunan banka, Türkiye'nin en köklü ve güçlü finansal kurumlarından biridir. 1.300'den fazla şubesi ve dijital kanallarıyla geniş bir müşteri kitlesine hizmet vermektedir.",
    website: "https://www.isbank.com.tr/",
    founded: "1924",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "ENKAI": {
    symbol: "ENKAI",
    name: "Enka İnşaat ve Sanayi A.Ş.",
    sector: "İnşaat / Holding",
    description: "1957 yılında kurulan Enka İnşaat, Türkiye'nin uluslararası alanda en etkin müteahhitlik ve enerji şirketlerinden biridir. İnşaat, enerji, gayrimenkul ve ticaret sektörlerinde faaliyet gösteren şirket, dünya genelinde 40'tan fazla ülkede projeler gerçekleştirmiştir. Engineering News-Record (ENR) tarafından dünyanın en büyük uluslararası müteahhitleri arasında gösterilmektedir.",
    website: "https://www.enka.com/",
    founded: "1957",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "TTKOM": {
    symbol: "TTKOM",
    name: "Türk Telekomünikasyon A.Ş.",
    sector: "Telekomünikasyon",
    description: "Türk Telekom, Türkiye'nin ilk ve lider entegre telekomünikasyon operatörüdür. Sabit hat, mobil, internet, TV ve dijital platformlarda hizmet veren şirket, 180 yılı aşkın geçmişe sahiptir. 2005 yılında özelleştirilen şirket, Türkiye'nin en yaygın telekomünikasyon altyapısını işletmektedir. 81 ilde yaklaşık 35 milyon aboneye hizmet vermektedir.",
    website: "https://www.turktelekom.com.tr/",
    founded: "1840 (PTT olarak), 1995 (Türk Telekom olarak)",
    headquarters: "Ankara, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "ASTOR": {
    symbol: "ASTOR",
    name: "Astor Enerji A.Ş.",
    sector: "Enerji / Elektrik Ekipmanları",
    description: "Astor Enerji, elektrik dağıtım ve iletim sektörüne yönelik orta ve yüksek gerilim ekipmanları üreten bir şirkettir. Şirket, transformatör merkezleri, anahtarlama ürünleri ve enerji dağıtım çözümleri sunmaktadır. Türkiye'nin yanı sıra birçok ülkeye ihracat yapan şirket, enerji sektöründe önemli bir konuma sahiptir.",
    website: "https://www.astor.com.tr/",
    founded: "1987",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "MGROS": {
    symbol: "MGROS",
    name: "Migros Ticaret A.Ş.",
    sector: "Perakende",
    description: "1954 yılında İsviçre Migros Kooperatifler Birliği ve İstanbul Belediyesi ortaklığıyla kurulan Migros, Türkiye'nin önde gelen süpermarket zincirlerinden biridir. Migros, Macrocenter, Migros Toptan ve Migros Sanal Market markaları altında faaliyet gösteren şirket, 81 ilde 2.500'den fazla mağazasıyla hizmet vermektedir. 2015 yılında Anadolu Grubu'nun ana hissedar olduğu şirket, online perakendecilikte de lider konumdadır.",
    website: "https://www.migroskurumsal.com/",
    founded: "1954",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "KCHOL": {
    symbol: "KCHOL",
    name: "Koç Holding A.Ş.",
    sector: "Holding",
    description: "1926 yılında Vehbi Koç tarafından kurulan Koç Holding, Türkiye'nin en büyük holdingi ve özel sektör kuruluşudur. Enerji, otomotiv, dayanıklı tüketim ve finans başta olmak üzere pek çok sektörde faaliyet gösteren şirket, Ford Otosan, Tofaş, Arçelik, Tüpraş, Yapı Kredi gibi şirketlerin ana ortağıdır. Fortune Global 500 listesinde yer alan sayılı Türk şirketlerinden biridir.",
    website: "https://www.koc.com.tr/",
    founded: "1926",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "SAHOL": {
    symbol: "SAHOL",
    name: "Hacı Ömer Sabancı Holding A.Ş.",
    sector: "Holding",
    description: "1967 yılında Hacı Ömer Sabancı tarafından kurulan Sabancı Holding, Türkiye'nin önde gelen holdingllerinden biridir. Bankacılık, enerji, perakende, dijital, sanayi, yapı malzemeleri ve diğer sektörlerde faaliyet gösteren şirket, Akbank, Enerjisa, Teknosa, Çimsa, Kordsa gibi şirketlerin ana ortağıdır. 13 ülkede yaklaşık 60.000 çalışanıyla faaliyet göstermektedir.",
    website: "https://www.sabanci.com/",
    founded: "1967",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "YKBNK": {
    symbol: "YKBNK",
    name: "Yapı ve Kredi Bankası A.Ş.",
    sector: "Bankacılık",
    description: "1944 yılında Türkiye'nin ilk özel bankası olarak kurulan Yapı Kredi, Koç Holding ve UniCredit ortaklığında faaliyet göstermektedir. Kurumsal, ticari, KOBİ, bireysel ve özel bankacılık hizmetleri sunan banka, Türkiye'nin dördüncü büyük özel bankasıdır. 800'den fazla şubesi ve dijital bankacılık kanallarıyla müşterilerine hizmet vermektedir.",
    website: "https://www.yapikredi.com.tr/",
    founded: "1944",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "ULKER": {
    symbol: "ULKER",
    name: "Ülker Bisküvi Sanayi A.Ş.",
    sector: "Gıda",
    description: "1944 yılında Sabri Ülker tarafından kurulan Ülker, Türkiye'nin en büyük gıda şirketlerinden biridir. Bisküvi, çikolata, kek ve şekerleme ürünleri üreten şirket, Yıldız Holding bünyesinde faaliyet göstermektedir. Godiva, McVitie's gibi global markaların da sahibi olan Yıldız Holding'in ana şirketlerinden olan Ülker, 7 ülkede 14 üretim tesisiyle 40'tan fazla ülkeye ihracat yapmaktadır.",
    website: "https://www.ulker.com.tr/",
    founded: "1944",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  },
  "EKGYO": {
    symbol: "EKGYO",
    name: "Emlak Konut Gayrimenkul Yatırım Ortaklığı A.Ş.",
    sector: "Gayrimenkul Yatırım Ortaklığı",
    description: "2002 yılında kurulan Emlak Konut GYO, Türkiye'nin en büyük gayrimenkul yatırım ortaklıklarından biridir. TOKİ'nin iştiraki olan şirket, gelir paylaşımı ve anahtar teslim projeler geliştirmektedir. Bugüne kadar 150 binden fazla konut ve işyerinin yapımını tamamlayan şirket, Türkiye'nin gayrimenkul sektöründeki öncü kuruluşlarındandır.",
    website: "https://www.emlakkonut.com.tr/",
    founded: "2002",
    headquarters: "İstanbul, Türkiye",
    priceInfo: {
      lastUpdate: "Dinamik olarak yüklenecek"
    }
  }
};

// Bu dosyayı modül olarak dışa aktarın (Node.js ortamında kullanım için)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    stocksData
  };
}