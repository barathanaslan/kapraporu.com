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
            <a href="/" class="logo">  <div class="logo-icon">F</div> finansraporu.com </a>

            <div style="text-align: right;"> <div class="footer-info" style="margin-bottom: 5px;"> © ${currentYear} finansraporu.com. Tüm hakları saklıdır.
              </div>
              <div class="footer-links">
                 <a href="/hakkimizda.html" style="color: rgba(255, 255, 255, 0.8); margin-left: 15px; text-decoration: none;">Hakkımızda</a>
                <a href="/yasal-uyari.html" style="color: var(--white); text-decoration: underline; font-weight: 500; margin-left: 15px;">Yasal Uyarı ve Kullanım Koşulları</a>
                 </div>
            </div>
          </div>

          <div class="disclaimer" style="margin-top: 30px; background-color: rgba(0,0,0,0.15); padding: 15px;"> Bu sitede (finansraporu.com) yer alan bilgiler ve yorumlar çeşitli kaynaklardan derlenmiş olup <strong>yalnızca bilgilendirme amaçlıdır</strong>. Sunulan içerik yatırım tavsiyesi niteliği taşımaz. Finansal kararlar almadan önce bilgilerin doğruluğunu resmi kaynaklardan teyit etmeniz ve/veya SPK tarafından yetkilendirilmiş profesyonel danışmanlık almanız şiddetle önerilir. Verilerin veya yorumların doğruluğu, eksiksizliği ve güncelliği konusunda hiçbir garanti verilmez.
          </div>
        </div>
      </footer>
    `;
  }
}

customElements.define('kap-footer', KapFooter);