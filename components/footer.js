// components/footer.js
class KapFooter extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Yılı dinamik olarak almak için
    const currentYear = new Date().getFullYear();

    this.innerHTML = `
      <footer>
        <div class="container">
          <div class="footer-content">
            <!-- Sol Taraf: Logo (Mevcut yapıdan alındı) -->
            <a href="/" class="logo">
              <div class="logo-icon">K</div> <!-- İstediğiniz logo ikonu -->
              kapraporu.com <!-- Sitenizin Adını Buraya Yazın -->
            </a>

            <!-- Sağ Taraf: Telif Hakkı ve Yasal Bağlantılar -->
            <div style="text-align: right;"> <!-- İçeriği sağa yaslamak için -->
                <!-- Telif Hakkı -->
                <div class="footer-info" style="margin-bottom: 5px;"> <!-- Altındaki linklere biraz boşluk -->
                  © ${currentYear} kapraporu.com. Tüm hakları saklıdır.
                </div>
                <!-- Yasal Bağlantılar -->
                <div class="footer-links">
                  <a href="hakkimizda.html" style="color: rgba(255, 255, 255, 0.8); margin-left: 15px; text-decoration: none;">Hakkımızda</a>
                  <a href="yasal-uyari.html" style="color: var(--white); text-decoration: underline; font-weight: 500; margin-left: 15px;">Yasal Uyarı ve Kullanım Koşulları</a>
                </div>
            </div>
          </div>

          <!-- Alt Kısım: Detaylı Yasal Uyarı -->
          <div class="disclaimer" style="margin-top: 30px; background-color: rgba(0,0,0,0.15); padding: 15px;"> <!-- Stili korundu, içerik güncellendi -->
            Bu sitede (kapraporu.com) yer alan bilgiler ve AI (Yapay Zeka) yorumlamaları Kamuoyu Aydınlatma Platformu'ndan (KAP) API aracılığıyla alınmaktadır ve <strong>yalnızca bilgilendirme amaçlıdır</strong>. Sunulan içerik yatırım tavsiyesi niteliği taşımaz. Finansal kararlar almadan önce bilgilerin doğruluğunu resmi kaynaklardan (örn: www.kap.org.tr) teyit etmeniz ve/veya SPK tarafından yetkilendirilmiş profesyonel danışmanlık almanız şiddetle önerilir. Verilerin veya AI yorumlamalarının doğruluğu, eksiksizliği ve güncelliği konusunda hiçbir garanti verilmez.
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('kap-footer', KapFooter);